const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/prototype-data.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function searchableRecords() {
  const modules = data.modules.map((module) => ({
    collection: 'modules',
    id: module.id,
    text: `${module.name} ${module.policy} ${(module.keywords || []).join(' ')} ${module.monthlyBudget} ${module.enabled ? 'actif' : 'inactif'}`
  }));
  const agents = data.agents.map((agent) => ({
    collection: 'agents',
    id: agent.id,
    text: `${agent.name} ${agent.role} ${agent.modelTier}`
  }));
  const decisions = data.decisions.map((decision) => ({
    collection: 'decisions',
    id: decision.id,
    text: `${decision.title} ${decision.owner} ${decision.risk} ${decision.status}`
  }));
  const artifacts = data.artifacts.map((artifact) => {
    const ownerModule = data.modules.find((module) => module.id === artifact.moduleId);

    return {
      collection: 'artifacts',
      id: artifact.id,
      text: `${artifact.name} ${artifact.type} ${artifact.status} ${ownerModule ? ownerModule.name : ''}`
    };
  });
  const integrations = data.integrations.map((integration) => ({
    collection: 'integrations',
    id: integration.id,
    text: `${integration.name} ${integration.category} ${integration.use} ${integration.connection} ${integration.costProfile}`
  }));

  return modules.concat(agents, decisions, artifacts, integrations);
}

function queryRecords(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return searchableRecords()
    .map((record) => {
      const normalizedText = record.text.toLowerCase();
      const score = terms.reduce((total, term) => total + (normalizedText.includes(term) ? 1 : 0), 0);
      return { ...record, score };
    })
    .filter((record) => record.score > 0)
    .sort((left, right) => right.score - left.score);
}

const requiredTargets = [
  'intake-form',
  'create-demo-account',
  'demo-account-card',
  'prepare-campaign',
  'test-campaign-card',
  'readiness-score',
  'readiness-list',
  'global-query',
  'run-query',
  'query-results',
  'journey-map',
  'modules-grid',
  'integration-catalog',
  'artifact-filter',
  'artifact-table'
];

for (const target of requiredTargets) {
  assert(html.includes(`id="${target}"`), `Journey target #${target} is missing from index.html.`);
}

assert(data.testCampaign.customerId === data.demoCustomer.id, 'Campaign must reference the demo customer account.');
assert(data.testCampaign.actions.length >= 4, 'Test campaign must include enough platform actions.');
assert(data.testCampaign.humanGates.length >= 2, 'Test campaign must include human approval gates.');
assert(data.integrations.length >= 8, 'Integration catalog should cover multiple external solution types.');

for (const journey of data.journeys) {
  assert(journey.steps.length >= 3, `Journey ${journey.id} should have at least three steps.`);
  assert(journey.successMetric, `Journey ${journey.id} is missing a success metric.`);
}

for (const question of data.intakeQuestions.filter((item) => item.required)) {
  assert(question.placeholder.length > 0, `Required intake question ${question.id} needs a placeholder.`);
}

for (const example of data.queryExamples) {
  const results = queryRecords(example.query);
  assert(
    results.some((result) => result.collection === example.expectedCollection && result.id === example.expectedId),
    `Query example "${example.query}" did not find ${example.expectedCollection}.${example.expectedId}.`
  );
}

console.log('Journey and query tests passed.');
