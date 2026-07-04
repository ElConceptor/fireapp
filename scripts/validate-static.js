const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'src/index.html',
  'src/styles.css',
  'src/app.js',
  'docs/agentic-marketing-saas-architecture.md',
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

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageText = JSON.stringify(packageJson).toLowerCase();

for (const term of forbiddenPackageTerms) {
  assert(!packageText.includes(term), `Legacy package term remains: ${term}`);
}

assert(!fs.existsSync(path.join(root, 'config.xml')), 'Legacy Cordova config.xml remains.');
assert(!fs.existsSync(path.join(root, 'resources')), 'Legacy resources directory remains.');
assert(!fs.existsSync(path.join(root, 'ionic.config.json')), 'Legacy Ionic config remains.');

console.log('Static prototype validation passed.');
