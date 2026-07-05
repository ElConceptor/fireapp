const assert = require('assert');
const { createApiServer } = require('../server/api');

async function api(baseUrl, method, pathname, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function main() {
  const { server, db } = createApiServer({ dbPath: ':memory:' });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // Inscription de deux tenants sur des plans differents.
    const starter = await api(baseUrl, 'POST', '/api/auth/register', {
      body: { companyName: 'Starter Co', email: 'owner@starter.test', password: 'motdepasse1', planId: 'starter' }
    });
    assert.strictEqual(starter.status, 201, 'Starter tenant registration must succeed.');

    const scale = await api(baseUrl, 'POST', '/api/auth/register', {
      body: { companyName: 'Scale Co', email: 'owner@scale.test', password: 'motdepasse2', planId: 'scale' }
    });
    assert.strictEqual(scale.status, 201, 'Scale tenant registration must succeed.');

    // Un email deja utilise est refuse.
    const duplicate = await api(baseUrl, 'POST', '/api/auth/register', {
      body: { companyName: 'Dup', email: 'owner@starter.test', password: 'motdepasse3' }
    });
    assert.strictEqual(duplicate.status, 409, 'Duplicate email must be rejected.');

    // Un mauvais mot de passe est refuse.
    const badLogin = await api(baseUrl, 'POST', '/api/auth/login', {
      body: { email: 'owner@starter.test', password: 'mauvais-mdp' }
    });
    assert.strictEqual(badLogin.status, 401, 'Wrong password must be rejected.');

    // Sans token, l API runtime est inaccessible.
    const anonymous = await api(baseUrl, 'GET', '/api/runtime');
    assert.strictEqual(anonymous.status, 401, 'Runtime requires authentication.');

    // Le runtime est filtre par plan cote serveur.
    const starterRuntime = await api(baseUrl, 'GET', '/api/runtime', { token: starter.body.token });
    assert.strictEqual(starterRuntime.status, 200);
    assert.strictEqual(starterRuntime.body.plan.id, 'starter');

    const mcpModule = starterRuntime.body.modules.find((module) => module.id === 'mcp');
    assert.strictEqual(mcpModule.inPlan, false, 'MCP module must be out of Starter plan.');

    const lockedPack = starterRuntime.body.promptPacks.find((pack) => pack.id === 'pack-sales-playbook');
    assert.strictEqual(lockedPack.unlocked, false, 'Scale pack must be locked for Starter.');
    assert.strictEqual(lockedPack.samplePrompt, null, 'Locked pack must not leak its prompt server-side.');

    const scaleRuntime = await api(baseUrl, 'GET', '/api/runtime', { token: scale.body.token });
    const unlockedPack = scaleRuntime.body.promptPacks.find((pack) => pack.id === 'pack-sales-playbook');
    assert.ok(unlockedPack.samplePrompt, 'Scale tenant must receive the unlocked prompt sample.');

    // Enforcement serveur: un tenant Starter ne peut pas activer un module Scale, meme en forgeant la requete.
    const forcedModule = await api(baseUrl, 'PATCH', '/api/tenant/modules/mcp', {
      token: starter.body.token,
      body: { enabled: true }
    });
    assert.strictEqual(forcedModule.status, 403, 'Out-of-plan module activation must be rejected server-side.');

    // Un module inclus dans le plan peut etre bascule et audite.
    const allowedModule = await api(baseUrl, 'PATCH', '/api/tenant/modules/product', {
      token: starter.body.token,
      body: { enabled: false, autonomy: 'manual' }
    });
    assert.strictEqual(allowedModule.status, 200);
    const productState = allowedModule.body.modules.find((module) => module.id === 'product');
    assert.strictEqual(productState.enabled, false);
    assert.strictEqual(productState.autonomy, 'manual');

    // Isolation tenant: l audit d un tenant n expose jamais l autre tenant.
    const starterAudit = await api(baseUrl, 'GET', '/api/audit', { token: starter.body.token });
    assert.ok(starterAudit.body.events.length >= 2, 'Starter audit must contain its own events.');
    assert.ok(
      starterAudit.body.events.every((event) => !event.actor.includes('scale.test')),
      'IDOR check: starter tenant must never see scale tenant events.'
    );

    const scaleAudit = await api(baseUrl, 'GET', '/api/audit', { token: scale.body.token });
    assert.ok(
      scaleAudit.body.events.every((event) => !event.actor.includes('starter.test')),
      'IDOR check: scale tenant must never see starter tenant events.'
    );

    // Verification directe en base: chaque evenement est rattache a un tenant.
    const orphanEvents = db.prepare('SELECT COUNT(*) AS total FROM audit_events WHERE tenant_id IS NULL').get();
    assert.strictEqual(orphanEvents.total, 0, 'Every audit event must belong to a tenant.');

    // Changement de plan: reserve au owner, applique cote serveur.
    const upgrade = await api(baseUrl, 'POST', '/api/tenant/plan', {
      token: starter.body.token,
      body: { planId: 'growth' }
    });
    assert.strictEqual(upgrade.status, 200);
    assert.strictEqual(upgrade.body.plan.id, 'growth');
    const campaignModule = upgrade.body.modules.find((module) => module.id === 'campaign');
    assert.strictEqual(campaignModule.inPlan, true, 'Growth plan must unlock the campaign module.');

    // Un token invalide est rejete.
    const forgedToken = await api(baseUrl, 'GET', '/api/runtime', { token: 'a'.repeat(64) });
    assert.strictEqual(forgedToken.status, 401, 'Forged tokens must be rejected.');

    console.log('Backend phase 1 tests passed: auth, tenant isolation, plan enforcement, audit.');
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
