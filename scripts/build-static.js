const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const docsDir = path.join(root, 'docs');
const distDir = path.join(root, 'dist');

execFileSync(process.execPath, [path.join(root, 'scripts', 'validate-static.js')], {
  stdio: 'inherit'
});

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

copyDirectory(sourceDir, distDir);
copyDirectory(docsDir, path.join(distDir, 'docs'));
console.log(`Static prototype built in ${path.relative(root, distDir)}.`);
