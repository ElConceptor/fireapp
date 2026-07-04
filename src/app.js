const workflow = [
  'Comprendre le produit ou service',
  'Demander les donnees manquantes',
  'Classer documents et hypotheses',
  'Produire segments, campagnes et budget',
  'Demander validation humaine',
  'Executer, mesurer et apprendre'
];

const agents = [
  {
    name: 'Orchestrateur principal',
    role: 'Decoupe les missions, assigne les agents, gere les validations et consolide les livrables.',
    model: 'Premium',
    cost: 0.42
  },
  {
    name: 'Agent produit',
    role: 'Interroge le souscripteur, lit les documents et formalise la proposition de valeur.',
    model: 'Intermediaire',
    cost: 0.08
  },
  {
    name: 'Agent marche',
    role: 'Analyse concurrents, segments, objections, canaux et tendances exploitables.',
    model: 'Recherche',
    cost: 0.16
  },
  {
    name: 'Agent campagne',
    role: 'Prepare messages, audiences, calendrier, budget et variantes creatives.',
    model: 'Economique',
    cost: 0.05
  }
];

const modules = [
  {
    id: 'product',
    name: 'Product Intelligence',
    enabled: true,
    policy: 'Brief produit valide par le client',
    monthlyBudget: 120,
    approvals: 2
  },
  {
    id: 'market',
    name: 'Market Research',
    enabled: true,
    policy: 'Sources citees et hypotheses tracees',
    monthlyBudget: 220,
    approvals: 1
  },
  {
    id: 'campaign',
    name: 'Campaign Builder',
    enabled: true,
    policy: 'Validation avant publication ou depense',
    monthlyBudget: 300,
    approvals: 3
  },
  {
    id: 'mcp',
    name: 'MCP Integrations',
    enabled: false,
    policy: 'OAuth, scopes limites et audit par connecteur',
    monthlyBudget: 180,
    approvals: 4
  }
];

const dataHubItems = [
  'Documents source et briefs client',
  'Artefacts marketing reutilisables',
  'Decisions humaines et audit trail',
  'Couts IA par agent, modele et module',
  'Memoire semantique et recherche'
];

const agenda = [
  {
    status: 'Socle',
    text: 'Base propre sans ancien prototype legacy.'
  },
  {
    status: 'Produit',
    text: 'Consolider mission detaillee, objectifs, agents, decisions et artefacts.'
  },
  {
    status: 'Data',
    text: 'Modeliser tenants, missions, tasks, documents, decisions et ai_usage_events.'
  },
  {
    status: 'Securite',
    text: 'Ajouter RBAC, isolation tenant, secrets, permissions MCP et retention.'
  }
];

const decisions = [
  {
    title: 'Valider le brief produit consolide',
    owner: 'Souscripteur',
    risk: 'Moyen',
    status: 'En attente'
  },
  {
    title: 'Autoriser une campagne LinkedIn test',
    owner: 'Admin marketing',
    risk: 'Eleve',
    status: 'Bloque avant budget'
  },
  {
    title: 'Connecter le CRM via MCP',
    owner: 'Admin tenant',
    risk: 'Eleve',
    status: 'Permissions requises'
  }
];

const modelRouting = [
  {
    tier: 'Premium',
    use: 'Strategie, arbitrage, consolidation finale',
    guardrail: 'Seulement sur taches a fort impact'
  },
  {
    tier: 'Intermediaire',
    use: 'Analyse documents, marche et synthese',
    guardrail: 'Batcher les documents par mission'
  },
  {
    tier: 'Economique',
    use: 'Extraction, classification, variantes',
    guardrail: 'Defaut pour taches repetitives'
  }
];

const artifacts = [
  {
    name: 'Brief produit consolide',
    type: 'Knowledge base',
    module: 'Product Intelligence',
    status: 'A valider'
  },
  {
    name: 'Carte segments et ICP',
    type: 'Market intelligence',
    module: 'Market Research',
    status: 'Brouillon'
  },
  {
    name: 'Plan campagne 30 jours',
    type: 'Go-to-market',
    module: 'Campaign Builder',
    status: 'Pret decision'
  },
  {
    name: 'Registre permissions outils',
    type: 'Security audit',
    module: 'MCP Integrations',
    status: 'Inactif'
  }
];

function renderList(targetId, items, renderItem) {
  const target = document.getElementById(targetId);
  target.innerHTML = items.map(renderItem).join('');
}

function formatEuro(value) {
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR`;
}

function activeModules() {
  return modules.filter((module) => module.enabled);
}

function computeBudget() {
  const activeBudget = activeModules().reduce((total, module) => total + module.monthlyBudget, 0);
  const usage = Math.round(activeBudget * 0.62);
  const approvals = activeModules().reduce((total, module) => total + module.approvals, 0);

  return {
    activeBudget,
    approvals,
    usage,
    remaining: activeBudget - usage,
    artifactCount: artifacts.filter((artifact) =>
      activeModules().some((module) => module.name === artifact.module)
    ).length
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

  renderList('workflow', workflow, (step, index) => `
    <article class="timeline-step">
      <span class="step-number">${index + 1}</span>
      <h3>${step}</h3>
      <p>Etape suivie par l orchestrateur avec preuves, couts et validation si necessaire.</p>
    </article>
  `);

  renderList('agents-grid', agents, (agent) => `
    <article class="agent-card">
      <h3>${agent.name}</h3>
      <p>${agent.role}</p>
      <div class="agent-meta">
        <span class="pill">${agent.model}</span>
        <span class="cost">${agent.cost.toFixed(2).replace('.', ',')} EUR</span>
      </div>
    </article>
  `);

  renderList('data-hub-list', dataHubItems, (item) => `<li>${item}</li>`);

  renderList('decision-list', decisions, (decision) => `
    <article class="decision-item">
      <div>
        <h3>${decision.title}</h3>
        <p>${decision.owner} · Risque ${decision.risk}</p>
      </div>
      <span class="pill warning">${decision.status}</span>
    </article>
  `);

  renderList('model-routing', modelRouting, (route) => `
    <article class="routing-item">
      <strong>${route.tier}</strong>
      <p>${route.use}</p>
      <small>${route.guardrail}</small>
    </article>
  `);

  renderList('modules-grid', modules, (module) => `
    <button class="module-card" data-module-id="${module.id}" data-enabled="${module.enabled}" type="button">
      <h3>${module.name}</h3>
      <p>${module.policy}</p>
      <div class="module-meta">
        <span class="pill">${module.enabled ? 'Actif' : 'Inactif'}</span>
        <span class="cost">${formatEuro(module.monthlyBudget)}</span>
      </div>
    </button>
  `);

  renderList('artifact-table', artifacts, (artifact) => {
    const module = modules.find((item) => item.name === artifact.module);
    const isActive = module && module.enabled;

    return `
      <article class="artifact-row" data-enabled="${isActive}">
        <div>
          <strong>${artifact.name}</strong>
          <p>${artifact.type} · ${artifact.module}</p>
        </div>
        <span class="pill">${isActive ? artifact.status : 'Module inactif'}</span>
      </article>
    `;
  });

  renderList('agenda-list', agenda, (item) => `
    <article class="agenda-item">
      <strong>${item.status}</strong>
      <p>${item.text}</p>
    </article>
  `);

  document.querySelectorAll('[data-module-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const module = modules.find((item) => item.id === button.dataset.moduleId);
      module.enabled = !module.enabled;
      renderPrototype();
    });
  });
}

renderPrototype();
