const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const sassDir = path.join(nodeModulesDir, 'sass');
const nodeSassDir = path.join(nodeModulesDir, 'node-sass');
const nodeSassLibDir = path.join(nodeSassDir, 'lib');
const ionicFunctionsFile = path.join(
  nodeModulesDir,
  'ionic-angular',
  'themes',
  'ionic.functions.scss'
);

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

if (fs.existsSync(ionicFunctionsFile)) {
  const originalSource = fs.readFileSync(ionicFunctionsFile, 'utf8');
  const patchedSource = originalSource
    .replace(
      /\$error-msg: "\s+The value `#\{\$color-value\}` must be a color\.\s+If you are setting the value as a map make sure\s+both the base and contrast are defined as colors\.\s+For example:\s+\$colors: \(\s+primary:\s+#327eff,\s+secondary:\s+\(base: #32db64, contrast: #000\),\s+\);";/,
      '$error-msg: "The value `#{$color-value}` must be a color. If you are setting the value as a map make sure both the base and contrast are defined as colors.";'
    )
    .replace(
      /\$error-msg: "\s+The map color `#\{\$color-name\}` is not defined\.\s+Please make sure the color exists in your\s+`\$colors` map\.\s+For example:\s+\$colors: \(\s+#\{\$color-name\}:\s+#327eff\s+\);";/,
      '$error-msg: "The map color `#{$color-name}` is not defined. Please make sure the color exists in your `$colors` map.";'
    );

  if (patchedSource !== originalSource) {
    fs.writeFileSync(ionicFunctionsFile, patchedSource);
    console.log('Ionic Sass legacy multiline strings patched.');
  }
}

console.log('node-sass shim points to Dart Sass.');
