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
  const promptPacks = data.promptPacks.map((pack) => ({
    collection: 'promptPacks',
    id: pack.id,
    text: `${pack.name} ${(pack.keywords || []).join(' ')} ${pack.outcome}`
  }));

  return modules.concat(agents, decisions, artifacts, integrations, promptPacks);
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
  'pricing-grid',
  'plan-summary',
  'prompt-packs',
  'agent-level-selector',
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
assert(data.pricingPlans.length >= 3, 'Monetization requires at least three pricing plans.');
assert(data.agentLevels.length >= 3, 'Agent levels must range from beginner to expert.');
assert(data.promptPacks.length >= 4, 'Prompt library must contain several packs.');

const sortedPlans = [...data.pricingPlans].sort((left, right) => left.rank - right.rank);
for (let index = 1; index < sortedPlans.length; index += 1) {
  assert(
    sortedPlans[index].monthlyPrice > sortedPlans[index - 1].monthlyPrice,
    'Plan prices must increase with rank.'
  );
  assert(
    sortedPlans[index].aiCredits > sortedPlans[index - 1].aiCredits,
    'Plan AI credits must increase with rank.'
  );
}

const starterPlan = data.pricingPlans.find((plan) => plan.rank === 1);
const starterUnlockedPacks = data.promptPacks.filter((pack) => {
  const requiredPlan = data.pricingPlans.find((plan) => plan.id === pack.minPlan);
  return requiredPlan.rank <= starterPlan.rank;
});
assert(starterUnlockedPacks.length >= 1, 'Starter plan must unlock at least one prompt pack.');

const topPlan = sortedPlans[sortedPlans.length - 1];
const expertLevel = data.agentLevels.find((level) => level.id === topPlan.maxAgentLevel);
assert(expertLevel && expertLevel.rank === Math.max(...data.agentLevels.map((level) => level.rank)),
  'Top plan must unlock the expert agent level.');

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
