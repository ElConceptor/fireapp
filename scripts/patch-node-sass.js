const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const sassDir = path.join(nodeModulesDir, 'sass');
const nodeSassDir = path.join(nodeModulesDir, 'node-sass');
const nodeSassLibDir = path.join(nodeSassDir, 'lib');

if (!fs.existsSync(sassDir)) {
  throw new Error('Dart Sass is missing. Run npm install before building.');
}

fs.mkdirSync(nodeSassLibDir, { recursive: true });

fs.writeFileSync(
  path.join(nodeSassDir, 'package.json'),
  JSON.stringify(
    {
      name: 'node-sass',
      version: '0.0.0-dart-sass-shim',
      main: 'lib/index.js',
      private: true
    },
    null,
    2
  ) + '\n'
);

fs.writeFileSync(
  path.join(nodeSassLibDir, 'index.js'),
  "module.exports = require('sass');\n"
);

console.log('node-sass shim points to Dart Sass.');
