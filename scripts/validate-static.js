const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'src/index.html',
  'src/styles.css',
  'src/app.js',
  'src/data/prototype-data.json',
  'docs/agentic-marketing-saas-architecture.md',
  'docs/data-hub-model.md',
  'docs/demo-campaign-scenario.md',
  'docs/runtime-contracts.md',
  'docs/project-agenda.md'
];

const forbiddenPackageTerms = [
  'ionic',
  'cordova',
  'firebase',
  'angularfire',
  'node-sass'
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNonEmptyString(value, fieldName) {
  assert(typeof value === 'string' && value.trim().length > 0, `${fieldName} must be a non-empty string.`);
}

function assertUniqueIds(items, collectionName) {
  const ids = new Set();

  for (const item of items) {
    assertNonEmptyString(item.id, `${collectionName}.id`);
    assert(!ids.has(item.id), `${collectionName} contains duplicate id: ${item.id}`);
    ids.add(item.id);
  }

  return ids;
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);
}

for (const file of ['src/app.js', 'scripts/build-static.js', 'scripts/clean.js', 'scripts/serve-static.js', 'scripts/test-journeys.js']) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], {
    stdio: 'inherit'
  });
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageText = JSON.stringify(packageJson).toLowerCase();
const prototypeData = JSON.parse(fs.readFileSync(path.join(root, 'src/data/prototype-data.json'), 'utf8'));

for (const term of forbiddenPackageTerms) {
  assert(!packageText.includes(term), `Legacy package term remains: ${term}`);
}

assertNonEmptyString(prototypeData.version, 'version');
assertNonEmptyString(prototypeData.mission.title, 'mission.title');
assert(
  typeof prototypeData.mission.defaultUsageRate === 'number' &&
    prototypeData.mission.defaultUsageRate >= 0 &&
    prototypeData.mission.defaultUsageRate <= 1,
  'mission.defaultUsageRate must be a number between 0 and 1.'
);

for (const collectionName of ['workflow', 'journeys', 'intakeQuestions', 'queryExamples', 'agents', 'modules', 'dataHubItems', 'decisions', 'modelRouting', 'artifacts', 'integrations', 'agenda']) {
  assert(Array.isArray(prototypeData[collectionName]), `${collectionName} must be an array.`);
  assert(prototypeData[collectionName].length > 0, `${collectionName} must not be empty.`);
}

const moduleIds = assertUniqueIds(prototypeData.modules, 'modules');
assertUniqueIds(prototypeData.agents, 'agents');
assertUniqueIds(prototypeData.decisions, 'decisions');
assertUniqueIds(prototypeData.artifacts, 'artifacts');
assertUniqueIds(prototypeData.journeys, 'journeys');
assertUniqueIds(prototypeData.intakeQuestions, 'intakeQuestions');
assertUniqueIds(prototypeData.integrations, 'integrations');

assertNonEmptyString(prototypeData.demoCustomer.companyName, 'demoCustomer.companyName');
assertNonEmptyString(prototypeData.demoCustomer.objective, 'demoCustomer.objective');
assertNonEmptyString(prototypeData.testCampaign.name, 'testCampaign.name');
assertNonEmptyString(prototypeData.testCampaign.customerId, 'testCampaign.customerId');
assert(
  prototypeData.testCampaign.customerId === prototypeData.demoCustomer.id,
  'testCampaign.customerId must reference demoCustomer.id.'
);
assert(
  typeof prototypeData.testCampaign.budget === 'number' && prototypeData.testCampaign.budget > 0,
  'testCampaign.budget must be positive.'
);

for (const module of prototypeData.modules) {
  assertNonEmptyString(module.name, `modules.${module.id}.name`);
  assert(typeof module.enabled === 'boolean', `modules.${module.id}.enabled must be a boolean.`);
  assert(typeof module.monthlyBudget === 'number' && module.monthlyBudget >= 0, `modules.${module.id}.monthlyBudget must be positive.`);
  assert(Number.isInteger(module.approvals) && module.approvals >= 0, `modules.${module.id}.approvals must be a positive integer.`);
  assert(Array.isArray(module.keywords), `modules.${module.id}.keywords must be an array.`);
  assert(module.keywords.length > 0, `modules.${module.id}.keywords must not be empty.`);
}

for (const agent of prototypeData.agents) {
  assertNonEmptyString(agent.name, `agents.${agent.id}.name`);
  assertNonEmptyString(agent.modelTier, `agents.${agent.id}.modelTier`);
  assert(typeof agent.unitCost === 'number' && agent.unitCost >= 0, `agents.${agent.id}.unitCost must be positive.`);
}

for (const artifact of prototypeData.artifacts) {
  assert(moduleIds.has(artifact.moduleId), `artifacts.${artifact.id}.moduleId references unknown module ${artifact.moduleId}.`);
}

for (const integration of prototypeData.integrations) {
  assertNonEmptyString(integration.category, `integrations.${integration.id}.category`);
  assertNonEmptyString(integration.name, `integrations.${integration.id}.name`);
  assertNonEmptyString(integration.connection, `integrations.${integration.id}.connection`);
}

for (const question of prototypeData.intakeQuestions) {
  assertNonEmptyString(question.label, `intakeQuestions.${question.id}.label`);
  assert(typeof question.required === 'boolean', `intakeQuestions.${question.id}.required must be a boolean.`);
}

for (const example of prototypeData.queryExamples) {
  assertNonEmptyString(example.query, 'queryExamples.query');
  assertNonEmptyString(example.expectedCollection, `queryExamples.${example.query}.expectedCollection`);
  assertNonEmptyString(example.expectedId, `queryExamples.${example.query}.expectedId`);
}

assert(!fs.existsSync(path.join(root, 'config.xml')), 'Legacy Cordova config.xml remains.');
assert(!fs.existsSync(path.join(root, 'resources')), 'Legacy resources directory remains.');
assert(!fs.existsSync(path.join(root, 'ionic.config.json')), 'Legacy Ionic config remains.');

console.log('Static prototype validation passed.');
