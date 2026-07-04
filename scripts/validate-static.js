const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'src/index.html',
  'src/styles.css',
  'src/app.js',
  'docs/agentic-marketing-saas-architecture.md',
  'docs/data-hub-model.md',
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

for (const term of forbiddenPackageTerms) {
  assert(!packageText.includes(term), `Legacy package term remains: ${term}`);
}

assert(!fs.existsSync(path.join(root, 'config.xml')), 'Legacy Cordova config.xml remains.');
assert(!fs.existsSync(path.join(root, 'resources')), 'Legacy resources directory remains.');
assert(!fs.existsSync(path.join(root, 'ionic.config.json')), 'Legacy Ionic config remains.');

console.log('Static prototype validation passed.');
