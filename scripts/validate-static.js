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

for (const file of ['src/app.js', 'scripts/build-static.js', 'scripts/clean.js', 'scripts/serve-static.js']) {
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

for (const collectionName of ['workflow', 'agents', 'modules', 'dataHubItems', 'decisions', 'modelRouting', 'artifacts', 'agenda']) {
  assert(Array.isArray(prototypeData[collectionName]), `${collectionName} must be an array.`);
  assert(prototypeData[collectionName].length > 0, `${collectionName} must not be empty.`);
}

const moduleIds = assertUniqueIds(prototypeData.modules, 'modules');
assertUniqueIds(prototypeData.agents, 'agents');
assertUniqueIds(prototypeData.decisions, 'decisions');
assertUniqueIds(prototypeData.artifacts, 'artifacts');

for (const module of prototypeData.modules) {
  assertNonEmptyString(module.name, `modules.${module.id}.name`);
  assert(typeof module.enabled === 'boolean', `modules.${module.id}.enabled must be a boolean.`);
  assert(typeof module.monthlyBudget === 'number' && module.monthlyBudget >= 0, `modules.${module.id}.monthlyBudget must be positive.`);
  assert(Number.isInteger(module.approvals) && module.approvals >= 0, `modules.${module.id}.approvals must be a positive integer.`);
}

for (const agent of prototypeData.agents) {
  assertNonEmptyString(agent.name, `agents.${agent.id}.name`);
  assertNonEmptyString(agent.modelTier, `agents.${agent.id}.modelTier`);
  assert(typeof agent.unitCost === 'number' && agent.unitCost >= 0, `agents.${agent.id}.unitCost must be positive.`);
}

for (const artifact of prototypeData.artifacts) {
  assert(moduleIds.has(artifact.moduleId), `artifacts.${artifact.id}.moduleId references unknown module ${artifact.moduleId}.`);
}

assert(!fs.existsSync(path.join(root, 'config.xml')), 'Legacy Cordova config.xml remains.');
assert(!fs.existsSync(path.join(root, 'resources')), 'Legacy resources directory remains.');
assert(!fs.existsSync(path.join(root, 'ionic.config.json')), 'Legacy Ionic config remains.');

console.log('Static prototype validation passed.');
