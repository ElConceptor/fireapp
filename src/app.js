const DATA_URL = './data/prototype-data.json';
const TOKEN_STORAGE_KEY = 'saas_token';

let prototypeData = null;
let intakeAnswers = {};
let artifactFilter = '';
let demoAccountCreated = false;
let campaignPrepared = false;
let selectedPlanId = 'growth';
let selectedAgentLevelId = 'confirme';
let selectedChatAgentId = 'orchestrator';
let chatMessages = [];
let missionState = 'idle';
let missionTaskStatuses = {};
let auditEvents = [];
let apiToken = null;
let apiRuntime = null;
let apiMode = 'local';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderList(targetId, items, renderItem) {
  const target = document.getElementById(targetId);
  target.innerHTML = items.map(renderItem).join('');
}

function formatEuro(value) {
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR`;
}

function activeModules() {
  return prototypeData.modules.filter((module) => module.enabled);
}

function moduleById(moduleId) {
  return prototypeData.modules.find((module) => module.id === moduleId);
}

function planById(planId) {
  return prototypeData.pricingPlans.find((plan) => plan.id === planId);
}

function levelById(levelId) {
  return prototypeData.agentLevels.find((level) => level.id === levelId);
}

function selectedPlan() {
  return planById(selectedPlanId);
}

function selectedLevel() {
  return levelById(selectedAgentLevelId);
}

function planAllows(minPlanId) {
  return selectedPlan().rank >= planById(minPlanId).rank;
}

function maxLevelForPlan(plan) {
  return levelById(plan.maxAgentLevel);
}

function applyPlanConstraints() {
  const plan = selectedPlan();

  prototypeData.modules.forEach((module) => {
    if (!plan.moduleIds.includes(module.id)) {
      module.enabled = false;
    }
  });

  if (selectedLevel().rank > maxLevelForPlan(plan).rank) {
    selectedAgentLevelId = plan.maxAgentLevel;
  }
}

async function apiRequest(method, pathname, body) {
  const response = await fetch(pathname, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function syncRuntimeFromApi() {
  if (!apiRuntime) {
    return;
  }

  selectedPlanId = apiRuntime.plan.id;
  const runtimeModules = new Map(apiRuntime.modules.map((module) => [module.id, module]));

  prototypeData.modules.forEach((module) => {
    const runtimeModule = runtimeModules.get(module.id);

    if (!runtimeModule) {
      return;
    }

    module.enabled = runtimeModule.enabled;
    module.autonomy = runtimeModule.autonomy;
  });

  applyPlanConstraints();
}

async function loadApiRuntime() {
  if (!apiToken) {
    return false;
  }

  const result = await apiRequest('GET', '/api/runtime');

  if (!result.ok) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    apiToken = null;
    apiRuntime = null;
    apiMode = 'local';
    return false;
  }

  apiRuntime = result.data;
  apiMode = 'api';
  syncRuntimeFromApi();
  demoAccountCreated = true;
  return true;
}

async function createDemoAccount() {
  const customer = prototypeData.demoCustomer;
  const result = await apiRequest('POST', '/api/auth/register', {
    companyName: customer.companyName,
    email: `demo-${Date.now()}@acme-sales.test`,
    password: 'demopassword1',
    planId: customer.planId || selectedPlanId
  });

  if (result.ok) {
    apiToken = result.data.token;
    localStorage.setItem(TOKEN_STORAGE_KEY, apiToken);
    await loadApiRuntime();
    recordAudit(`Compte reel cree via API (${customer.companyName}).`);
    demoAccountCreated = true;
    return;
  }

  demoAccountCreated = true;
  apiMode = 'local';
  recordAudit('Compte demo local (API indisponible ou erreur).');
}

function autonomyById(autonomyId) {
  return prototypeData.autonomyLevels.find((level) => level.id === autonomyId);
}

function computeBudget() {
  const activeBudget = activeModules().reduce((total, module) => total + module.monthlyBudget, 0);
  const usage = Math.round(activeBudget * prototypeData.mission.defaultUsageRate);
  const approvals = activeModules().reduce((total, module) => {
    const autonomy = autonomyById(module.autonomy);
    return total + module.approvals + (autonomy ? autonomy.approvalWeight : 0);
  }, 0);

  return {
    activeBudget,
    approvals,
    usage,
    remaining: activeBudget - usage,
    artifactCount: prototypeData.artifacts.filter((artifact) => {
      const ownerModule = moduleById(artifact.moduleId);
      return ownerModule && ownerModule.enabled;
    }).length
  };
}

function searchableRecords() {
  const moduleRecords = prototypeData.modules.map((module) => ({
    id: module.id,
    type: 'Module',
    title: module.name,
    text: `${module.name} ${module.policy} ${(module.keywords || []).join(' ')} ${module.monthlyBudget} ${module.enabled ? 'actif' : 'inactif'}`
  }));
  const agentRecords = prototypeData.agents.map((agent) => ({
    id: agent.id,
    type: 'Agent',
    title: agent.name,
    text: `${agent.name} ${agent.role} ${agent.modelTier}`
  }));
  const decisionRecords = prototypeData.decisions.map((decision) => ({
    id: decision.id,
    type: 'Decision',
    title: decision.title,
    text: `${decision.title} ${decision.owner} ${decision.risk} ${decision.status}`
  }));
  const artifactRecords = prototypeData.artifacts.map((artifact) => {
    const ownerModule = moduleById(artifact.moduleId);

    return {
      id: artifact.id,
      type: 'Artefact',
      title: artifact.name,
      text: `${artifact.name} ${artifact.type} ${artifact.status} ${ownerModule ? ownerModule.name : ''}`
    };
  });
  const integrationRecords = prototypeData.integrations.map((integration) => ({
    id: integration.id,
    type: 'Integration',
    title: integration.name,
    text: `${integration.name} ${integration.category} ${integration.use} ${integration.connection} ${integration.costProfile}`
  }));
  const promptPackRecords = prototypeData.promptPacks.map((pack) => ({
    id: pack.id,
    type: 'Prompt pack',
    title: pack.name,
    text: `${pack.name} ${(pack.keywords || []).join(' ')} ${pack.outcome}`
  }));
  const toolRecords = prototypeData.agentTools.map((tool) => ({
    id: tool.id,
    type: 'Outil',
    title: tool.name,
    text: `${tool.name} ${(tool.keywords || []).join(' ')} ${tool.purpose} ${tool.governance}`
  }));
  const reportRecords = prototypeData.reportTemplates.map((report) => ({
    id: report.id,
    type: 'Rapport',
    title: report.name,
    text: `${report.name} ${report.framework} ${(report.keywords || []).join(' ')} ${report.description}`
  }));

  return moduleRecords.concat(agentRecords, decisionRecords, artifactRecords, integrationRecords, promptPackRecords, toolRecords, reportRecords);
}

function runQuery(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return searchableRecords()
    .map((record) => {
      const normalizedText = record.text.toLowerCase();
      const score = terms.reduce((total, term) => total + (normalizedText.includes(term) ? 1 : 0), 0);
      return { ...record, score };
    })
    .filter((record) => record.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
}

function renderQueryResults(results, query) {
  const target = document.getElementById('query-results');

  if (!query.trim()) {
    target.innerHTML = '<p>Essayez une recherche: budget campagne, CRM MCP ou brief produit.</p>';
    return;
  }

  if (!results.length) {
    target.innerHTML = '<p>Aucun resultat. L orchestrateur devra demander plus de contexte.</p>';
    return;
  }

  target.innerHTML = results.slice(0, 6).map((result) => `
    <article class="query-result">
      <span class="pill">${escapeHtml(result.type)}</span>
      <strong>${escapeHtml(result.title)}</strong>
    </article>
  `).join('');
}

function computeReadiness() {
  const requiredQuestions = prototypeData.intakeQuestions.filter((question) => question.required);
  const completedRequired = requiredQuestions.filter((question) =>
    (intakeAnswers[question.id] || '').trim().length > 0
  );
  const score = requiredQuestions.length === 0
    ? 100
    : Math.round((completedRequired.length / requiredQuestions.length) * 100);

  return {
    score,
    missing: requiredQuestions.filter((question) => !completedRequired.includes(question))
  };
}

function renderIntake() {
  renderList('intake-form', prototypeData.intakeQuestions, (question) => `
    <label class="input-group" for="intake-${question.id}">
      <span>${escapeHtml(question.label)}${question.required ? ' *' : ''}</span>
      <textarea id="intake-${question.id}" data-intake-id="${question.id}" rows="3" placeholder="${escapeHtml(question.placeholder)}">${escapeHtml(intakeAnswers[question.id] || '')}</textarea>
    </label>
  `);

  document.querySelectorAll('[data-intake-id]').forEach((input) => {
    input.addEventListener('input', () => {
      intakeAnswers[input.dataset.intakeId] = input.value;
      renderReadiness();
    });
  });

  renderReadiness();
}

function renderReadiness() {
  const readiness = computeReadiness();
  document.getElementById('readiness-score').textContent = `${readiness.score}%`;
  document.getElementById('readiness-summary').textContent = readiness.score === 100
    ? 'Brief pret pour lancer les agents.'
    : 'Informations encore necessaires avant orchestration.';

  const items = readiness.missing.length
    ? readiness.missing.map((question) => `Manque: ${question.label}`)
    : ['Produit compris', 'Cible identifiee', 'Objectif exploitable'];

  renderList('readiness-list', items, (item) => `<li>${escapeHtml(item)}</li>`);

  const launchButton = document.getElementById('launch-mission');
  launchButton.disabled = readiness.score < 100 || missionState === 'running';
  launchButton.textContent = missionState === 'running'
    ? 'Mission en cours...'
    : missionState === 'done'
      ? 'Relancer la mission'
      : 'Lancer la mission';
}

function renderDemoAccount() {
  const target = document.getElementById('demo-account-card');

  if (!demoAccountCreated) {
    target.className = 'empty-state';
    target.textContent = 'Aucun compte demo cree.';
    return;
  }

  const customer = prototypeData.demoCustomer;
  const tenantName = apiRuntime ? apiRuntime.tenant.name : customer.companyName;
  const planName = apiRuntime ? apiRuntime.plan.name : customer.plan;
  target.className = 'account-card';
  target.innerHTML = `
    <h3>${escapeHtml(tenantName)}</h3>
    <p>${escapeHtml(customer.product)}</p>
    <p><span class="pill ${apiMode === 'api' ? 'pill-success' : ''}">${apiMode === 'api' ? 'Mode API actif' : 'Mode demo local'}</span></p>
    <dl class="account-meta">
      <div>
        <dt>Plan</dt>
        <dd>${escapeHtml(planName)}</dd>
      </div>
      <div>
        <dt>Objectif</dt>
        <dd>${escapeHtml(customer.objective)}</dd>
      </div>
    </dl>
    <p><strong>Cible:</strong> ${escapeHtml(customer.targetAudience)}</p>
    <p><strong>Limites:</strong> ${escapeHtml(customer.constraints)}</p>
    <div class="capability-list">
      ${customer.capabilities.map((capability) => `<span class="pill">${escapeHtml(capability)}</span>`).join('')}
    </div>
  `;
}

function renderTestCampaign() {
  const target = document.getElementById('test-campaign-card');

  if (!demoAccountCreated) {
    target.className = 'empty-state';
    target.textContent = 'Creer le compte demo pour preparer la campagne.';
    return;
  }

  if (!campaignPrepared) {
    target.className = 'empty-state';
    target.textContent = 'Compte cree. La campagne attend la preparation par les agents.';
    return;
  }

  const campaign = prototypeData.testCampaign;
  target.className = 'campaign-card';
  target.innerHTML = `
    <h3>${escapeHtml(campaign.name)}</h3>
    <p>${escapeHtml(campaign.objective)}</p>
    <div class="campaign-kpis">
      <span><strong>${formatEuro(campaign.budget)}</strong> budget</span>
      <span><strong>${escapeHtml(campaign.duration)}</strong> duree</span>
    </div>
    <p><strong>Audience:</strong> ${escapeHtml(campaign.audience)}</p>
    <div class="mini-grid">
      <div>
        <strong>Canaux</strong>
        <ul>${campaign.channels.map((channel) => `<li>${escapeHtml(channel)}</li>`).join('')}</ul>
      </div>
      <div>
        <strong>Actions agents</strong>
        <ul>${campaign.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join('')}</ul>
      </div>
      <div>
        <strong>Validations humaines</strong>
        <ul>${campaign.humanGates.map((gate) => `<li>${escapeHtml(gate)}</li>`).join('')}</ul>
      </div>
    </div>
  `;
}

function renderPricing() {
  const plan = selectedPlan();

  renderList('pricing-grid', prototypeData.pricingPlans, (pricingPlan) => `
    <button class="pricing-card" data-plan-id="${pricingPlan.id}" data-selected="${pricingPlan.id === selectedPlanId}" type="button">
      <span class="pill">${pricingPlan.id === selectedPlanId ? 'Plan actif' : 'Choisir'}</span>
      <h3>${escapeHtml(pricingPlan.name)}</h3>
      <p class="price"><strong>${formatEuro(pricingPlan.monthlyPrice)}</strong>/mois</p>
      <p>${escapeHtml(pricingPlan.tagline)}</p>
      <ul>
        <li>${pricingPlan.aiCredits.toLocaleString('fr-FR')} credits IA</li>
        <li>Agents jusqu au niveau ${escapeHtml(levelById(pricingPlan.maxAgentLevel).name)}</li>
        <li>${pricingPlan.moduleIds.length} module(s) inclus</li>
        <li>${escapeHtml(pricingPlan.integrationAllowance)}</li>
        <li>Support: ${escapeHtml(pricingPlan.supportLevel)}</li>
      </ul>
      <small>${escapeHtml(pricingPlan.bestFor)}</small>
    </button>
  `);

  const unlockedPacks = prototypeData.promptPacks.filter((pack) => planAllows(pack.minPlan)).length;
  const unlockedIntegrations = prototypeData.integrations.filter((integration) => planAllows(integration.minPlan)).length;

  document.getElementById('plan-summary').innerHTML = `
    <strong>Plan ${escapeHtml(plan.name)}:</strong>
    ${unlockedPacks}/${prototypeData.promptPacks.length} prompt packs debloques ·
    ${unlockedIntegrations}/${prototypeData.integrations.length} connecteurs disponibles ·
    niveau agent maximum ${escapeHtml(maxLevelForPlan(plan).name)}.
  `;

  document.querySelectorAll('[data-plan-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (selectedPlanId !== button.dataset.planId) {
        recordAudit(`Plan change vers ${planById(button.dataset.planId).name}.`);
      }

      selectedPlanId = button.dataset.planId;
      applyPlanConstraints();
      renderPrototype();
    });
  });
}

function renderPromptPacks() {
  renderList('prompt-packs', prototypeData.promptPacks, (pack) => {
    const unlocked = planAllows(pack.minPlan);
    const requiredPlan = planById(pack.minPlan);

    return `
      <article class="prompt-card" data-unlocked="${unlocked}">
        <div class="prompt-card__header">
          <span class="pill${unlocked ? '' : ' warning'}">${unlocked ? 'Debloque' : `Plan ${escapeHtml(requiredPlan.name)}`}</span>
          <small>${pack.promptCount} prompts</small>
        </div>
        <h3>${escapeHtml(pack.name)}</h3>
        <p>${escapeHtml(pack.outcome)}</p>
        ${unlocked
          ? `<blockquote>${escapeHtml(pack.samplePrompt)}</blockquote>`
          : '<blockquote class="locked">Prompt visible apres upgrade.</blockquote>'}
      </article>
    `;
  });
}

function renderAgentLevels() {
  const plan = selectedPlan();
  const maxRank = maxLevelForPlan(plan).rank;

  renderList('agent-level-selector', prototypeData.agentLevels, (level) => {
    const allowed = level.rank <= maxRank;

    return `
      <button class="level-option" data-level-id="${level.id}" data-selected="${level.id === selectedAgentLevelId}" data-allowed="${allowed}" type="button" ${allowed ? '' : 'disabled'}>
        <strong>${escapeHtml(level.name)}</strong>
        <span>${escapeHtml(level.modelTier)} · x${level.costMultiplier.toLocaleString('fr-FR')}</span>
        <small>${allowed ? escapeHtml(level.description) : `Disponible avec le plan superieur`}</small>
      </button>
    `;
  });

  document.querySelectorAll('[data-level-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.allowed !== 'true') {
        return;
      }

      selectedAgentLevelId = button.dataset.levelId;
      renderPrototype();
    });
  });
}

function recordAudit(action) {
  auditEvents.unshift({
    time: new Date().toLocaleTimeString('fr-FR'),
    action
  });
  renderAuditLog();
}

function renderAuditLog() {
  const target = document.getElementById('audit-log');

  if (!auditEvents.length) {
    target.innerHTML = '<p class="chat-hint">Chaque action sensible sera tracee ici.</p>';
    return;
  }

  target.innerHTML = auditEvents.slice(0, 12).map((event) => `
    <div class="audit-event">
      <span>${escapeHtml(event.time)}</span>
      <p>${escapeHtml(event.action)}</p>
    </div>
  `).join('');
}

function agentById(agentId) {
  return prototypeData.agents.find((agent) => agent.id === agentId);
}

function renderMissionTasks() {
  const target = document.getElementById('mission-tasks');

  if (missionState === 'idle') {
    target.innerHTML = '<p class="chat-hint">Completer l intake puis lancer la mission.</p>';
    return;
  }

  target.innerHTML = prototypeData.missionPlan.map((task) => {
    const agent = agentById(task.agentId);
    const status = missionTaskStatuses[task.id] || 'pending';
    const statusLabel = status === 'done' ? 'Termine' : status === 'running' ? 'En cours...' : 'En attente';

    return `
      <div class="mission-task" data-status="${status}">
        <span class="agent-avatar" aria-hidden="true">${agent.avatar}</span>
        <div>
          <strong>${escapeHtml(task.title)}</strong>
          <p>${escapeHtml(agent.name)} · ${escapeHtml(task.output)}</p>
        </div>
        <span class="pill${status === 'done' ? '' : ' warning'}">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

function renderMissionBrief() {
  const target = document.getElementById('mission-brief');

  if (missionState !== 'done') {
    target.className = 'empty-state';
    target.textContent = missionState === 'running'
      ? 'Les agents travaillent, le brief arrive...'
      : 'Le brief GTM apparaitra ici apres la mission.';
    return;
  }

  const product = intakeAnswers.product || 'votre offre';
  const audience = intakeAnswers.audience || 'votre cible';
  const objective = intakeAnswers.objective || 'votre objectif';
  const constraints = intakeAnswers.constraints || 'aucune contrainte declaree';

  target.className = 'brief-card';
  target.innerHTML = `
    <span class="pill">Executive summary · Pyramide de Minto</span>
    <h3>Brief GTM genere par l equipe IA</h3>
    <p><strong>Conclusion:</strong> ${escapeHtml(product)} peut atteindre "${escapeHtml(objective)}" en concentrant l effort sur ${escapeHtml(audience)}.</p>
    <ol>
      <li><strong>Cible prioritaire:</strong> ${escapeHtml(audience)}, adressee par messages orientes benefices avec preuves.</li>
      <li><strong>Plan d action:</strong> sequence multicanale 30 jours (LinkedIn, email, landing page) avec tests A/B.</li>
      <li><strong>Contraintes respectees:</strong> ${escapeHtml(constraints)}; toute depense et publication passe en validation humaine.</li>
    </ol>
    <p><strong>Decision demandee:</strong> valider ce brief pour debloquer la preparation de campagne.</p>
  `;
}

function runMission() {
  if (missionState === 'running') {
    return;
  }

  missionState = 'running';
  missionTaskStatuses = {};
  recordAudit('Mission lancee depuis l intake par le souscripteur.');
  renderMissionTasks();
  renderMissionBrief();

  prototypeData.missionPlan.forEach((task, index) => {
    setTimeout(() => {
      missionTaskStatuses[task.id] = 'running';
      renderMissionTasks();
    }, index * 900);

    setTimeout(() => {
      missionTaskStatuses[task.id] = 'done';
      renderMissionTasks();

      if (index === prototypeData.missionPlan.length - 1) {
        missionState = 'done';
        recordAudit('Brief GTM genere et soumis a validation humaine.');
        renderMissionBrief();
      }
    }, index * 900 + 750);
  });
}

function renderReportTemplates() {
  renderList('report-templates', prototypeData.reportTemplates, (report) => {
    const unlocked = planAllows(report.minPlan);
    const requiredPlan = planById(report.minPlan);

    return `
      <article class="report-card" data-unlocked="${unlocked}">
        <div class="prompt-card__header">
          <span class="pill${unlocked ? '' : ' warning'}">${unlocked ? 'Disponible' : `Plan ${escapeHtml(requiredPlan.name)}`}</span>
          <small>${escapeHtml(report.framework)}</small>
        </div>
        <h3>${escapeHtml(report.name)}</h3>
        <p>${escapeHtml(report.description)}</p>
        <ul>${report.sections.map((section) => `<li>${escapeHtml(section)}</li>`).join('')}</ul>
      </article>
    `;
  });
}

function chatAgent() {
  return prototypeData.agents.find((agent) => agent.id === selectedChatAgentId);
}

function speakReply(text) {
  if (!document.getElementById('voice-toggle').checked) {
    return;
  }

  if (typeof window.speechSynthesis === 'undefined') {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function renderChat() {
  renderList('agent-picker', prototypeData.agents, (agent) => `
    <button class="agent-chip" data-chat-agent="${agent.id}" data-selected="${agent.id === selectedChatAgentId}" type="button">
      <span class="agent-avatar" aria-hidden="true">${agent.avatar}</span>
      <span>${escapeHtml(agent.name)}</span>
    </button>
  `);

  document.querySelectorAll('[data-chat-agent]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedChatAgentId = button.dataset.chatAgent;
      chatMessages.push({ from: 'agent', agentId: selectedChatAgentId, text: chatAgent().greeting });
      renderChat();
    });
  });

  const log = document.getElementById('chat-log');

  if (!chatMessages.length) {
    log.innerHTML = '<p class="chat-hint">Choisissez un agent et posez votre premiere question.</p>';
    return;
  }

  log.innerHTML = chatMessages.map((message) => {
    if (message.from === 'user') {
      return `<div class="chat-message user"><p>${escapeHtml(message.text)}</p></div>`;
    }

    const agent = prototypeData.agents.find((item) => item.id === message.agentId);

    return `
      <div class="chat-message agent">
        <span class="agent-avatar" aria-hidden="true">${agent.avatar}</span>
        <div>
          <strong>${escapeHtml(agent.name)}</strong>
          <p>${escapeHtml(message.text)}</p>
        </div>
      </div>
    `;
  }).join('');
  log.scrollTop = log.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();

  if (!text) {
    return;
  }

  chatMessages.push({ from: 'user', text });

  const normalizedText = text.toLowerCase();
  const bestAgent = prototypeData.agents
    .map((agent) => {
      const haystack = `${agent.role} ${(agent.skills || []).join(' ')}`.toLowerCase();
      const score = normalizedText.split(/\s+/).reduce(
        (total, term) => total + (term.length > 3 && haystack.includes(term) ? 1 : 0),
        0
      );
      return { agent, score };
    })
    .sort((left, right) => right.score - left.score)[0];

  const responder = bestAgent && bestAgent.score > 0 ? bestAgent.agent : chatAgent();
  selectedChatAgentId = responder.id;
  chatMessages.push({ from: 'agent', agentId: responder.id, text: responder.chatReply });

  input.value = '';
  renderChat();
  speakReply(responder.chatReply);
}

function renderAgentTools() {
  renderList('agent-tools-grid', prototypeData.agentTools, (tool) => {
    const unlocked = planAllows(tool.minPlan);
    const requiredPlan = planById(tool.minPlan);

    return `
      <article class="tool-card" data-unlocked="${unlocked}">
        <div class="prompt-card__header">
          <span class="pill${unlocked ? '' : ' warning'}">${unlocked ? 'Disponible' : `Plan ${escapeHtml(requiredPlan.name)}`}</span>
        </div>
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.purpose)}</p>
        <small>${escapeHtml(tool.governance)}</small>
      </article>
    `;
  });
}

function renderQaAgents() {
  renderList('qa-agents-grid', prototypeData.qaAgents, (agent) => `
    <article class="agent-card qa-card">
      <h3>${escapeHtml(agent.name)}</h3>
      <p>${escapeHtml(agent.role)}</p>
      <div class="agent-meta">
        <span class="pill">${escapeHtml(agent.trigger)}</span>
      </div>
    </article>
  `);
}

function renderAutonomyMatrix() {
  const plan = selectedPlan();

  renderList('autonomy-matrix', prototypeData.modules, (module) => {
    const inPlan = plan.moduleIds.includes(module.id);

    return `
      <article class="autonomy-row" data-in-plan="${inPlan}">
        <div>
          <strong>${escapeHtml(module.name)}</strong>
          <p>${inPlan ? 'Niveau d autonomie des agents' : 'Module hors plan'}</p>
        </div>
        <div class="autonomy-options" role="group" aria-label="Autonomie ${escapeHtml(module.name)}">
          ${prototypeData.autonomyLevels.map((level) => `
            <button
              type="button"
              data-autonomy-module="${module.id}"
              data-autonomy-level="${level.id}"
              data-selected="${module.autonomy === level.id}"
              title="${escapeHtml(level.description)}"
              ${inPlan ? '' : 'disabled'}
            >${escapeHtml(level.name)}</button>
          `).join('')}
        </div>
      </article>
    `;
  });

  document.querySelectorAll('[data-autonomy-module]').forEach((button) => {
    button.addEventListener('click', () => {
      const module = moduleById(button.dataset.autonomyModule);
      module.autonomy = button.dataset.autonomyLevel;
      recordAudit(`Autonomie de ${module.name} reglee sur ${autonomyById(module.autonomy).name}.`);
      renderPrototype();
    });
  });
}

function renderSecurity() {
  renderList('security-controls', prototypeData.securityControls, (control) => `
    <article class="security-item">
      <div>
        <strong>${escapeHtml(control.name)}</strong>
        <p>${escapeHtml(control.detail)}</p>
      </div>
      <span class="pill${control.status.startsWith('Exige') ? ' warning' : ''}">${escapeHtml(control.status)}</span>
    </article>
  `);

  const plan = selectedPlan();
  const level = selectedLevel();
  const usageRatio = Math.min(prototypeData.mission.defaultUsageRate * level.costMultiplier, 1);
  const creditsUsed = Math.round(plan.aiCredits * usageRatio);
  const creditsRemaining = plan.aiCredits - creditsUsed;
  const percentage = Math.round(usageRatio * 100);

  document.getElementById('credit-used-label').textContent =
    `${creditsUsed.toLocaleString('fr-FR')} credits consommes (niveau ${level.name})`;
  document.getElementById('credit-used-bar').style.width = `${percentage}%`;
  document.getElementById('credit-used-bar').dataset.alert = percentage >= 80;
  document.getElementById('credit-remaining-label').textContent =
    `${creditsRemaining.toLocaleString('fr-FR')} credits restants sur ${plan.aiCredits.toLocaleString('fr-FR')} (plan ${plan.name})${percentage >= 80 ? ' · Alerte seuil 80%' : ''}`;
}

function renderMetrics() {
  const budget = computeBudget();
  const plan = selectedPlan();
  const metrics = [
    { label: 'Plan', value: `${plan.name}` },
    { label: 'Budget IA', value: formatEuro(budget.activeBudget) },
    { label: 'Validations', value: budget.approvals }
  ];

  renderList('mission-metrics', metrics, (metric) => `
    <div>
      <dt>${escapeHtml(metric.label)}</dt>
      <dd>${escapeHtml(String(metric.value))}</dd>
    </div>
  `);

  const percentage = budget.activeBudget > 0 ? Math.round((budget.usage / budget.activeBudget) * 100) : 0;
  document.getElementById('budget-used-label').textContent = `${formatEuro(budget.usage)} consommes`;
  document.getElementById('budget-used-bar').style.width = `${percentage}%`;
  document.getElementById('budget-remaining-label').textContent =
    `${formatEuro(budget.remaining)} restants sur ${formatEuro(budget.activeBudget)}`;
}

function renderPrototype() {
  renderPricing();
  renderPromptPacks();
  renderAgentLevels();
  renderReportTemplates();
  renderChat();
  renderAgentTools();
  renderQaAgents();
  renderAutonomyMatrix();
  renderSecurity();
  renderIntake();
  renderMissionTasks();
  renderMissionBrief();
  renderAuditLog();
  renderDemoAccount();
  renderTestCampaign();
  renderMetrics();

  renderList('workflow', prototypeData.workflow, (step, index) => `
    <article class="timeline-step">
      <span class="step-number">${index + 1}</span>
      <h3>${escapeHtml(step)}</h3>
      <p>Etape suivie par l orchestrateur avec preuves, couts et validation si necessaire.</p>
    </article>
  `);

  const level = selectedLevel();

  renderList('agents-grid', prototypeData.agents, (agent) => {
    const adjustedCost = agent.unitCost * level.costMultiplier;

    return `
    <article class="agent-card">
      <div class="agent-card__identity">
        <span class="agent-avatar large" aria-hidden="true">${agent.avatar}</span>
        <h3>${escapeHtml(agent.name)}</h3>
      </div>
      <p>${escapeHtml(agent.role)}</p>
      <div class="skill-list">
        ${(agent.skills || []).map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`).join('')}
      </div>
      <div class="agent-meta">
        <span class="pill">${escapeHtml(level.name)} · ${escapeHtml(level.modelTier)}</span>
        <span class="cost">${adjustedCost.toFixed(2).replace('.', ',')} EUR</span>
      </div>
    </article>
  `;
  });

  renderList('data-hub-list', prototypeData.dataHubItems, (item) => `<li>${escapeHtml(item)}</li>`);

  renderList('decision-list', prototypeData.decisions, (decision) => {
    const resolved = decision.status === 'Approuve' || decision.status === 'Rejete';

    return `
    <article class="decision-item">
      <div>
        <h3>${escapeHtml(decision.title)}</h3>
        <p>${escapeHtml(decision.owner)} · Risque ${escapeHtml(decision.risk)}</p>
      </div>
      <div class="decision-actions">
        <span class="pill${decision.status === 'Approuve' ? '' : ' warning'}">${escapeHtml(decision.status)}</span>
        ${resolved ? '' : `
          <button type="button" data-decision-approve="${decision.id}">Approuver</button>
          <button type="button" data-decision-reject="${decision.id}">Rejeter</button>
        `}
      </div>
    </article>
  `;
  });

  document.querySelectorAll('[data-decision-approve]').forEach((button) => {
    button.addEventListener('click', () => {
      const decision = prototypeData.decisions.find((item) => item.id === button.dataset.decisionApprove);
      decision.status = 'Approuve';
      recordAudit(`Decision approuvee: ${decision.title} (${decision.owner}).`);
      renderPrototype();
    });
  });

  document.querySelectorAll('[data-decision-reject]').forEach((button) => {
    button.addEventListener('click', () => {
      const decision = prototypeData.decisions.find((item) => item.id === button.dataset.decisionReject);
      decision.status = 'Rejete';
      recordAudit(`Decision rejetee: ${decision.title} (${decision.owner}).`);
      renderPrototype();
    });
  });

  renderList('model-routing', prototypeData.modelRouting, (route) => `
    <article class="routing-item">
      <strong>${escapeHtml(route.tier)}</strong>
      <p>${escapeHtml(route.use)}</p>
      <small>${escapeHtml(route.guardrail)}</small>
    </article>
  `);

  const plan = selectedPlan();

  renderList('modules-grid', prototypeData.modules, (module) => {
    const inPlan = plan.moduleIds.includes(module.id);
    const statusLabel = !inPlan ? 'Hors plan' : module.enabled ? 'Actif' : 'Inactif';

    return `
    <button class="module-card" data-module-id="${module.id}" data-enabled="${module.enabled}" data-in-plan="${inPlan}" type="button" ${inPlan ? '' : 'disabled'}>
      <h3>${escapeHtml(module.name)}</h3>
      <p>${escapeHtml(module.policy)}</p>
      <div class="module-meta">
        <span class="pill${inPlan ? '' : ' warning'}">${statusLabel}</span>
        <span class="cost">${formatEuro(module.monthlyBudget)}</span>
      </div>
    </button>
  `;
  });

  renderList('integration-catalog', prototypeData.integrations, (integration) => {
    const unlocked = planAllows(integration.minPlan);
    const requiredPlan = planById(integration.minPlan);

    return `
    <article class="integration-card" data-unlocked="${unlocked}">
      <div class="integration-card__header">
        <span class="pill">${escapeHtml(integration.category)}</span>
        <span class="pill${unlocked ? '' : ' warning'}">${unlocked ? 'Inclus' : `Plan ${escapeHtml(requiredPlan.name)}`}</span>
      </div>
      <h3>${escapeHtml(integration.name)}</h3>
      <p>${escapeHtml(integration.use)}</p>
      <small>${escapeHtml(integration.connection)} · ${escapeHtml(integration.costProfile)}</small>
    </article>
  `;
  });

  const normalizedArtifactFilter = artifactFilter.trim().toLowerCase();
  const filteredArtifacts = prototypeData.artifacts.filter((artifact) => {
    const ownerModule = moduleById(artifact.moduleId);
    const haystack = `${artifact.name} ${artifact.type} ${artifact.status} ${ownerModule ? ownerModule.name : ''}`.toLowerCase();
    return !normalizedArtifactFilter || haystack.includes(normalizedArtifactFilter);
  });

  renderList('artifact-table', filteredArtifacts, (artifact) => {
    const ownerModule = moduleById(artifact.moduleId);
    const isActive = ownerModule && ownerModule.enabled;
    const moduleName = ownerModule ? ownerModule.name : 'Module inconnu';

    return `
      <article class="artifact-row" data-enabled="${isActive}">
        <div>
          <strong>${escapeHtml(artifact.name)}</strong>
          <p>${escapeHtml(artifact.type)} · ${escapeHtml(moduleName)}</p>
        </div>
        <span class="pill">${isActive ? escapeHtml(artifact.status) : 'Module inactif'}</span>
      </article>
    `;
  });

  if (!filteredArtifacts.length) {
    document.getElementById('artifact-table').innerHTML = '<p>Aucun artefact ne correspond au filtre.</p>';
  }

  renderList('journey-map', prototypeData.journeys, (journey) => `
    <article class="journey-card">
      <strong>${escapeHtml(journey.actor)}</strong>
      <h3>${escapeHtml(journey.title)}</h3>
      <ol>
        ${journey.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <p>${escapeHtml(journey.successMetric)}</p>
    </article>
  `);

  renderList('agenda-list', prototypeData.agenda, (item) => `
    <article class="agenda-item">
      <strong>${escapeHtml(item.status)}</strong>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `);

  document.querySelectorAll('[data-module-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.inPlan !== 'true') {
        return;
      }

      const module = moduleById(button.dataset.moduleId);
      module.enabled = !module.enabled;
      recordAudit(`Module ${module.name} ${module.enabled ? 'active' : 'desactive'}.`);
      renderPrototype();
    });
  });

  const queryInput = document.getElementById('global-query');
  const currentQuery = queryInput.value;
  renderQueryResults(runQuery(currentQuery), currentQuery);
}

function renderLoadError(error) {
  document.getElementById('prototype-error').hidden = false;
  document.getElementById('prototype-error').textContent =
    `Impossible de charger le contrat prototype: ${error.message}`;
}

async function start() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    prototypeData = clone(await response.json());
    selectedPlanId = prototypeData.demoCustomer.planId || prototypeData.pricingPlans[0].id;
    selectedAgentLevelId = maxLevelForPlan(selectedPlan()).id;
    apiToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    await loadApiRuntime();
    applyPlanConstraints();
    document.getElementById('mission-title').textContent = prototypeData.mission.title;
    document.getElementById('mission-summary').textContent = prototypeData.mission.summary;
    renderPrototype();
    document.getElementById('run-query').addEventListener('click', () => {
      const queryInput = document.getElementById('global-query');
      renderQueryResults(runQuery(queryInput.value), queryInput.value);
    });
    document.getElementById('global-query').addEventListener('input', (event) => {
      renderQueryResults(runQuery(event.target.value), event.target.value);
    });
    document.getElementById('artifact-filter').addEventListener('input', (event) => {
      artifactFilter = event.target.value;
      renderPrototype();
      document.getElementById('artifact-filter').focus();
    });
    document.getElementById('create-demo-account').addEventListener('click', async () => {
      await createDemoAccount();
      renderPrototype();
      document.getElementById('prepare-campaign').focus();
    });
    document.getElementById('launch-mission').addEventListener('click', runMission);

    const voiceButton = document.getElementById('voice-input');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceButton.disabled = true;
      voiceButton.title = 'Reconnaissance vocale non supportee par ce navigateur';
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;

      recognition.addEventListener('result', (event) => {
        document.getElementById('chat-input').value = event.results[0][0].transcript;
        sendChatMessage();
      });

      voiceButton.addEventListener('click', () => {
        recognition.start();
      });
    }
    document.getElementById('chat-send').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendChatMessage();
      }
    });
    document.getElementById('prepare-campaign').addEventListener('click', () => {
      if (!demoAccountCreated) {
        renderTestCampaign();
        document.getElementById('create-demo-account').focus();
        return;
      }

      campaignPrepared = true;
      recordAudit('Campagne test preparee par les agents; validations requises avant execution.');
      renderPrototype();
    });
  } catch (error) {
    renderLoadError(error);
  }
}

start();
