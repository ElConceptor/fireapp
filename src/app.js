const DATA_URL = './data/prototype-data.json';

let prototypeData = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function computeBudget() {
  const activeBudget = activeModules().reduce((total, module) => total + module.monthlyBudget, 0);
  const usage = Math.round(activeBudget * prototypeData.mission.defaultUsageRate);
  const approvals = activeModules().reduce((total, module) => total + module.approvals, 0);

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

function renderMetrics() {
  const budget = computeBudget();
  const metrics = [
    { label: 'Budget IA', value: formatEuro(budget.activeBudget) },
    { label: 'Validations', value: budget.approvals },
    { label: 'Artefacts', value: budget.artifactCount }
  ];

  renderList('mission-metrics', metrics, (metric) => `
    <div>
      <dt>${metric.label}</dt>
      <dd>${metric.value}</dd>
    </div>
  `);

  const percentage = budget.activeBudget > 0 ? Math.round((budget.usage / budget.activeBudget) * 100) : 0;
  document.getElementById('budget-used-label').textContent = `${formatEuro(budget.usage)} consommes`;
  document.getElementById('budget-used-bar').style.width = `${percentage}%`;
  document.getElementById('budget-remaining-label').textContent =
    `${formatEuro(budget.remaining)} restants sur ${formatEuro(budget.activeBudget)}`;
}

function renderPrototype() {
  renderMetrics();

  renderList('workflow', prototypeData.workflow, (step, index) => `
    <article class="timeline-step">
      <span class="step-number">${index + 1}</span>
      <h3>${step}</h3>
      <p>Etape suivie par l orchestrateur avec preuves, couts et validation si necessaire.</p>
    </article>
  `);

  renderList('agents-grid', prototypeData.agents, (agent) => `
    <article class="agent-card">
      <h3>${agent.name}</h3>
      <p>${agent.role}</p>
      <div class="agent-meta">
        <span class="pill">${agent.modelTier}</span>
        <span class="cost">${agent.unitCost.toFixed(2).replace('.', ',')} EUR</span>
      </div>
    </article>
  `);

  renderList('data-hub-list', prototypeData.dataHubItems, (item) => `<li>${item}</li>`);

  renderList('decision-list', prototypeData.decisions, (decision) => `
    <article class="decision-item">
      <div>
        <h3>${decision.title}</h3>
        <p>${decision.owner} · Risque ${decision.risk}</p>
      </div>
      <span class="pill warning">${decision.status}</span>
    </article>
  `);

  renderList('model-routing', prototypeData.modelRouting, (route) => `
    <article class="routing-item">
      <strong>${route.tier}</strong>
      <p>${route.use}</p>
      <small>${route.guardrail}</small>
    </article>
  `);

  renderList('modules-grid', prototypeData.modules, (module) => `
    <button class="module-card" data-module-id="${module.id}" data-enabled="${module.enabled}" type="button">
      <h3>${module.name}</h3>
      <p>${module.policy}</p>
      <div class="module-meta">
        <span class="pill">${module.enabled ? 'Actif' : 'Inactif'}</span>
        <span class="cost">${formatEuro(module.monthlyBudget)}</span>
      </div>
    </button>
  `);

  renderList('artifact-table', prototypeData.artifacts, (artifact) => {
    const ownerModule = moduleById(artifact.moduleId);
    const isActive = ownerModule && ownerModule.enabled;
    const moduleName = ownerModule ? ownerModule.name : 'Module inconnu';

    return `
      <article class="artifact-row" data-enabled="${isActive}">
        <div>
          <strong>${artifact.name}</strong>
          <p>${artifact.type} · ${moduleName}</p>
        </div>
        <span class="pill">${isActive ? artifact.status : 'Module inactif'}</span>
      </article>
    `;
  });

  renderList('agenda-list', prototypeData.agenda, (item) => `
    <article class="agenda-item">
      <strong>${item.status}</strong>
      <p>${item.text}</p>
    </article>
  `);

  document.querySelectorAll('[data-module-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const module = moduleById(button.dataset.moduleId);
      module.enabled = !module.enabled;
      renderPrototype();
    });
  });
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
    document.getElementById('mission-title').textContent = prototypeData.mission.title;
    document.getElementById('mission-summary').textContent = prototypeData.mission.summary;
    renderPrototype();
  } catch (error) {
    renderLoadError(error);
  }
}

start();
