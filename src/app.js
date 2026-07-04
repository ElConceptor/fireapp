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
    cost: '0,42 EUR'
  },
  {
    name: 'Agent produit',
    role: 'Interroge le souscripteur, lit les documents et formalise la proposition de valeur.',
    model: 'Intermediaire',
    cost: '0,08 EUR'
  },
  {
    name: 'Agent marche',
    role: 'Analyse concurrents, segments, objections, canaux et tendances exploitables.',
    model: 'Recherche',
    cost: '0,16 EUR'
  },
  {
    name: 'Agent campagne',
    role: 'Prepare messages, audiences, calendrier, budget et variantes creatives.',
    model: 'Economique',
    cost: '0,05 EUR'
  }
];

const modules = [
  {
    name: 'Product Intelligence',
    enabled: true,
    policy: 'Brief produit valide par le client'
  },
  {
    name: 'Market Research',
    enabled: true,
    policy: 'Sources citees et hypotheses tracees'
  },
  {
    name: 'Campaign Builder',
    enabled: true,
    policy: 'Validation avant publication ou depense'
  },
  {
    name: 'MCP Integrations',
    enabled: false,
    policy: 'OAuth, scopes limites et audit par connecteur'
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

function renderList(targetId, items, renderItem) {
  const target = document.getElementById(targetId);
  target.innerHTML = items.map(renderItem).join('');
}

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
      <span class="cost">${agent.cost}</span>
    </div>
  </article>
`);

renderList('data-hub-list', dataHubItems, (item) => `<li>${item}</li>`);

renderList('modules-grid', modules, (module) => `
  <article class="module-card" data-enabled="${module.enabled}">
    <h3>${module.name}</h3>
    <p>${module.policy}</p>
    <div class="module-meta">
      <span class="pill">${module.enabled ? 'Actif' : 'Inactif'}</span>
    </div>
  </article>
`);

renderList('agenda-list', agenda, (item) => `
  <article class="agenda-item">
    <strong>${item.status}</strong>
    <p>${item.text}</p>
  </article>
`);
