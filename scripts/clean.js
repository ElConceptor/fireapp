const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

for (const dir of ['dist']) {
  fs.rmSync(path.join(root, dir), { recursive: true, force: true });
}

console.log('Generated files removed.');
