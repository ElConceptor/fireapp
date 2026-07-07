const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const { openDatabase, loadContract, recordAudit } = require('./db');
const { hashPassword, verifyPassword, createSession, authenticate } = require('./auth');

const contract = loadContract();

const staticRoot = fs.existsSync(path.resolve(__dirname, '..', 'dist'))
  ? path.resolve(__dirname, '..', 'dist')
  : path.resolve(__dirname, '..', 'src');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function planById(planId) {
  return contract.pricingPlans.find((plan) => plan.id === planId);
}

function planAllows(tenantPlan, minPlanId) {
  return tenantPlan.rank >= planById(minPlanId).rank;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error('Body too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function seedTenantModules(db, tenantId, plan) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO tenant_modules (tenant_id, module_id, enabled, autonomy) VALUES (?, ?, ?, ?)'
  );

  for (const module of contract.modules) {
    const inPlan = plan.moduleIds.includes(module.id);
    insert.run(tenantId, module.id, inPlan && module.enabled ? 1 : 0, module.autonomy);
  }
}

function buildRuntime(db, session) {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(session.tenantId);
  const plan = planById(tenant.plan_id);
  const moduleStates = db.prepare('SELECT module_id, enabled, autonomy FROM tenant_modules WHERE tenant_id = ?')
    .all(session.tenantId);
  const stateByModule = new Map(moduleStates.map((row) => [row.module_id, row]));

  return {
    tenant: { id: tenant.id, name: tenant.name, planId: tenant.plan_id },
    user: { email: session.email, role: session.role },
    plan: {
      id: plan.id,
      name: plan.name,
      aiCredits: plan.aiCredits,
      maxAgentLevel: plan.maxAgentLevel
    },
    modules: contract.modules.map((module) => {
      const state = stateByModule.get(module.id);
      const inPlan = plan.moduleIds.includes(module.id);

      return {
        id: module.id,
        name: module.name,
        policy: module.policy,
        monthlyBudget: module.monthlyBudget,
        approvals: module.approvals,
        inPlan,
        enabled: inPlan && state ? Boolean(state.enabled) : false,
        autonomy: state ? state.autonomy : module.autonomy
      };
    }),
    agents: contract.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      role: agent.role,
      skills: agent.skills
    })),
    promptPacks: contract.promptPacks.map((pack) => {
      const unlocked = planAllows(plan, pack.minPlan);

      return {
        id: pack.id,
        name: pack.name,
        promptCount: pack.promptCount,
        outcome: pack.outcome,
        unlocked,
        samplePrompt: unlocked ? pack.samplePrompt : null
      };
    }),
    integrations: contract.integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      category: integration.category,
      unlocked: planAllows(plan, integration.minPlan)
    })),
    reportTemplates: contract.reportTemplates.map((report) => ({
      id: report.id,
      name: report.name,
      framework: report.framework,
      unlocked: planAllows(plan, report.minPlan)
    })),
    agentTools: contract.agentTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      governance: tool.governance,
      unlocked: planAllows(plan, tool.minPlan)
    }))
  };
}

async function handleApi(db, request, response, url) {
  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    const body = await readBody(request);
    const { companyName, email, password } = body;
    const planId = body.planId || 'starter';

    if (!companyName || !email || !password || password.length < 8) {
      sendJson(response, 400, { error: 'companyName, email et password (8+ caracteres) sont requis.' });
      return;
    }

    if (!planById(planId)) {
      sendJson(response, 400, { error: 'Plan inconnu.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      sendJson(response, 409, { error: 'Email deja enregistre.' });
      return;
    }

    const tenantId = `tenant_${crypto.randomUUID()}`;
    const userId = `user_${crypto.randomUUID()}`;

    db.prepare('INSERT INTO tenants (id, name, plan_id) VALUES (?, ?, ?)').run(tenantId, companyName, planId);
    db.prepare('INSERT INTO users (id, tenant_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
      .run(userId, tenantId, email, hashPassword(password), 'owner');
    seedTenantModules(db, tenantId, planById(planId));
    recordAudit(db, tenantId, email, `Tenant cree avec le plan ${planById(planId).name}.`);

    const session = createSession(db, { id: userId, tenant_id: tenantId });
    sendJson(response, 201, { tenantId, token: session.token, expiresAt: session.expiresAt });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(request);
    const user = body.email
      ? db.prepare('SELECT * FROM users WHERE email = ?').get(body.email)
      : null;

    if (!user || !body.password || !verifyPassword(body.password, user.password_hash)) {
      sendJson(response, 401, { error: 'Identifiants invalides.' });
      return;
    }

    const session = createSession(db, user);
    recordAudit(db, user.tenant_id, user.email, 'Connexion reussie.');
    sendJson(response, 200, { tenantId: user.tenant_id, token: session.token, expiresAt: session.expiresAt });
    return;
  }

  const session = authenticate(db, request);

  if (!session) {
    sendJson(response, 401, { error: 'Authentification requise.' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/runtime') {
    sendJson(response, 200, buildRuntime(db, session));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/audit') {
    const events = db.prepare(
      'SELECT actor, action, created_at FROM audit_events WHERE tenant_id = ? ORDER BY id DESC LIMIT 50'
    ).all(session.tenantId);
    sendJson(response, 200, { events });
    return;
  }

  const moduleMatch = url.pathname.match(/^\/api\/tenant\/modules\/([a-z0-9-]+)$/);

  if (request.method === 'PATCH' && moduleMatch) {
    if (!['owner', 'admin'].includes(session.role)) {
      sendJson(response, 403, { error: 'Role insuffisant pour modifier les modules.' });
      return;
    }

    const moduleId = moduleMatch[1];
    const module = contract.modules.find((item) => item.id === moduleId);

    if (!module) {
      sendJson(response, 404, { error: 'Module inconnu.' });
      return;
    }

    const tenant = db.prepare('SELECT plan_id FROM tenants WHERE id = ?').get(session.tenantId);
    const plan = planById(tenant.plan_id);

    if (!plan.moduleIds.includes(moduleId)) {
      recordAudit(db, session.tenantId, session.email, `Tentative refusee d activer le module hors plan ${module.name}.`);
      sendJson(response, 403, { error: `Le module ${module.name} n est pas inclus dans le plan ${plan.name}.` });
      return;
    }

    const body = await readBody(request);
    const updates = [];

    if (typeof body.enabled === 'boolean') {
      db.prepare('UPDATE tenant_modules SET enabled = ? WHERE tenant_id = ? AND module_id = ?')
        .run(body.enabled ? 1 : 0, session.tenantId, moduleId);
      updates.push(body.enabled ? 'active' : 'desactive');
    }

    if (typeof body.autonomy === 'string') {
      if (!contract.autonomyLevels.some((level) => level.id === body.autonomy)) {
        sendJson(response, 400, { error: 'Niveau d autonomie inconnu.' });
        return;
      }

      db.prepare('UPDATE tenant_modules SET autonomy = ? WHERE tenant_id = ? AND module_id = ?')
        .run(body.autonomy, session.tenantId, moduleId);
      updates.push(`autonomie ${body.autonomy}`);
    }

    if (!updates.length) {
      sendJson(response, 400, { error: 'Aucune modification fournie.' });
      return;
    }

    recordAudit(db, session.tenantId, session.email, `Module ${module.name}: ${updates.join(', ')}.`);
    sendJson(response, 200, buildRuntime(db, session));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/tenant/plan') {
    if (session.role !== 'owner') {
      sendJson(response, 403, { error: 'Seul le owner peut changer de plan.' });
      return;
    }

    const body = await readBody(request);
    const plan = planById(body.planId);

    if (!plan) {
      sendJson(response, 400, { error: 'Plan inconnu.' });
      return;
    }

    db.prepare('UPDATE tenants SET plan_id = ? WHERE id = ?').run(plan.id, session.tenantId);
    db.prepare(
      `UPDATE tenant_modules SET enabled = 0
       WHERE tenant_id = ? AND module_id NOT IN (${plan.moduleIds.map(() => '?').join(',')})`
    ).run(session.tenantId, ...plan.moduleIds);
    seedTenantModules(db, session.tenantId, plan);
    recordAudit(db, session.tenantId, session.email, `Plan change vers ${plan.name}.`);
    sendJson(response, 200, buildRuntime(db, session));
    return;
  }

  sendJson(response, 404, { error: 'Route inconnue.' });
}

function serveStatic(request, response, url) {
  const requestPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const baseDir = requestPath.startsWith('/docs/') ? path.resolve(__dirname, '..') : staticRoot;
  const filePath = path.normalize(path.join(baseDir, requestPath));

  if (!filePath.startsWith(staticRoot) && !filePath.startsWith(path.resolve(__dirname, '..', 'docs'))) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    response.end(content);
  });
}

function createRequestHandler(db, options = {}) {
  const apiOnly = Boolean(options.apiOnly);

  return async function handleRequest(request, response) {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApi(db, request, response, url);
        return;
      }

      if (apiOnly) {
        sendJson(response, 404, { error: 'Route inconnue.' });
        return;
      }

      if (request.method === 'GET') {
        serveStatic(request, response, url);
        return;
      }

      sendJson(response, 405, { error: 'Methode non autorisee.' });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
  };
}

function createApiServer(options = {}) {
  const db = openDatabase(options.dbPath);
  const server = http.createServer(createRequestHandler(db));

  return { server, db };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4180);
  const host = process.env.HOST || '127.0.0.1';
  const { server } = createApiServer();

  server.listen(port, host, () => {
    console.log(`API multi-tenant disponible sur http://${host}:${port}`);
  });
}

module.exports = { createApiServer, createRequestHandler, handleApi };
