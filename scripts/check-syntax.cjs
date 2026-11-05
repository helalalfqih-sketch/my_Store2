// Parse every JS/JSX module and verify local imports without requiring
// a native Android/iOS toolchain. Run with @babel/parser installed.
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('@babel/parser');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git', '.ci-deps']);
let checked = 0;
let errors = 0;

function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) {
      scan(absolute);
      continue;
    }
    if (!/\.(?:js|jsx|mjs|cjs)$/.test(item.name)) continue;
    const relative = path.relative(root, absolute);
    const text = fs.readFileSync(absolute, 'utf8');
    checked += 1;
    try {
      const ast = parse(text, {
        sourceType: 'unambiguous',
        plugins: ['jsx'],
        errorRecovery: false,
      });
      for (const statement of ast.program.body) {
        if (statement.type !== 'ImportDeclaration') continue;
        const specifier = statement.source.value;
        if (!specifier.startsWith('.')) continue;
        const target = path.resolve(path.dirname(absolute), specifier);
        if (![target, target + '.js', target + '.jsx', target + '.mjs', target + '.cjs', path.join(target, 'index.js')].some(file => fs.existsSync(file))) {
          throw new Error('Unresolved relative import: ' + specifier);
        }
      }
      console.log('OK ' + relative);
    } catch (error) {
      errors += 1;
      console.error('FAIL ' + relative + ': ' + error.message);
    }
  }
}

scan(root);
console.log('Checked ' + checked + ' JavaScript/JSX modules.');
if (!checked || errors) process.exitCode = 1;
