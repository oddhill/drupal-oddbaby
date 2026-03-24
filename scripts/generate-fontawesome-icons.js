/* eslint-env node */
/**
 * @file
 * Generates a list of Font Awesome icon class names by scanning the installed CSS.
 *
 * Usage:
 *   node scripts/generate-fontawesome-icons.js
 *   node scripts/generate-fontawesome-icons.js --css path/to/all.css --out build/fontawesome-icons.json
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    css: null,
    out: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--css') {
      args.css = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--out') {
      args.out = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

function extractIconClasses(cssText) {
  const icons = new Set();
  const stylefulIcons = new Set();

  // Primary pattern in modern FA: `.fa-some-icon{--fa:"\f000"}` (minified or not).
  const varRegex = /\.fa-([a-z0-9-]+)\s*\{[^}]*?--fa\s*:\s*(["'])\\[a-f0-9]{3,5}\2/gi;
  let match = null;
  while ((match = varRegex.exec(cssText))) {
    icons.add(`fa-${match[1]}`);
  }

  // Fallback: legacy pseudo-element mapping `.fa-some-icon:before{content:"\f000"}`.
  const beforeRegex = /\.fa-([a-z0-9-]+)\s*::?before\b/gi;
  while ((match = beforeRegex.exec(cssText))) {
    icons.add(`fa-${match[1]}`);
  }

  // Detect brands icons from CSS: look for .fa-brands.fa-ICON selectors.
  const brandsRegex = /\.fa-brands\.fa-([a-z0-9-]+)\b/gi;
  const brandsSet = new Set();
  let bmatch = null;
  while ((bmatch = brandsRegex.exec(cssText))) {
    brandsSet.add(`fa-${bmatch[1]}`);
  }

  for (const icon of icons) {
    if (brandsSet.has(icon)) {
      stylefulIcons.add(`fa-brands ${icon}`);
    } else {
      stylefulIcons.add(`fa-solid ${icon}`);
    }
  }

  return Array.from(stylefulIcons).sort();
}

function main() {
  const args = parseArgs(process.argv);

  const defaultCssPath = path.join(
    THEME_ROOT,
    'node_modules',
    '@fortawesome',
    'fontawesome-free',
    'css',
    'all.css',
  );

  const cssPath = path.resolve(THEME_ROOT, args.css || defaultCssPath);
  const outPath = path.resolve(
    THEME_ROOT,
     args.out || path.join('build', 'fontawesome-icons.json'),
  );

  if (!fs.existsSync(cssPath)) {
    // eslint-disable-next-line no-console
    console.error(`Font Awesome CSS not found: ${path.relative(THEME_ROOT, cssPath)}`);
    process.exitCode = 1;
    return;
  }

  const cssText = fs.readFileSync(cssPath, 'utf8');
  const icons = extractIconClasses(cssText);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: path.relative(THEME_ROOT, cssPath),
    count: icons.length,
    icons,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${icons.length} icons to ${path.relative(THEME_ROOT, outPath)}`);
}

main();
