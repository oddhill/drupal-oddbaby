/* eslint-env node */
/**
 * @file
 * Generates component libraries and webpack entries from component.libraries.yml files.
 *
 * This script:
 * 1. Scans templates/components/** for component.libraries.yml
 * 2. Merges them into the theme's root custom_components_dev.libraries.yml
 * 3. Generates scripts/.generated/component-entries.json for webpack
 *
 * Run automatically via `yarn start` or `yarn build`.
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const THEME_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_ROOT = path.join(THEME_ROOT, 'templates', 'components');
const THEME_LIBRARIES_FILE = path.join(THEME_ROOT, 'custom_components_dev.libraries.yml');
const GENERATED_DIR = path.join(THEME_ROOT, 'scripts', '.generated');
const GENERATED_COMPONENT_ENTRIES_FILE = path.join(GENERATED_DIR, 'component-entries.json');

const BEGIN_MARKER = '# BEGIN COMPONENT LIBRARIES (generated)';
const END_MARKER = '# END COMPONENT LIBRARIES (generated)';

function* walkDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function findComponentLibraryFiles() {
  const files = [];
  for (const filePath of walkDir(COMPONENTS_ROOT)) {
    if (path.basename(filePath) === 'component.libraries.yml') {
      files.push(filePath);
    }
  }
  return files.sort();
}

function loadLibrariesFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = YAML.parse(raw);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid YAML structure in ${path.relative(THEME_ROOT, filePath)}`);
  }
  return parsed;
}

function buildGeneratedBlock(mergedLibraries) {
  const yamlText = YAML.stringify(mergedLibraries, {
    indent: 2,
    lineWidth: 0,
  }).trimEnd();

  const body = yamlText ? `${yamlText}\n` : '';
  return `${BEGIN_MARKER}\n${body}${END_MARKER}\n`;
}

function replaceBetweenMarkers(sourceText, generatedBlock) {
  const beginIndex = sourceText.indexOf(BEGIN_MARKER);
  const endIndex = sourceText.indexOf(END_MARKER);

  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) {
    const trimmed = sourceText.replace(/\s*$/, '');
    return `${trimmed}\n\n${generatedBlock}`;
  }

  const before = sourceText.slice(0, beginIndex);
  const after = sourceText.slice(endIndex + END_MARKER.length);
  const afterNormalized = after.startsWith('\n') ? after : `\n${after}`;

  return `${before}${generatedBlock}${afterNormalized}`;
}

function main() {
  const componentLibraryFiles = findComponentLibraryFiles();

  const merged = {};
  const componentEntries = {};

  for (const filePath of componentLibraryFiles) {
    const libs = loadLibrariesFromFile(filePath);
    const componentDir = path.dirname(filePath);

    for (const [key, value] of Object.entries(libs)) {
      if (Object.prototype.hasOwnProperty.call(merged, key)) {
        throw new Error(`Duplicate library key "${key}" in ${path.relative(THEME_ROOT, filePath)}`);
      }
      merged[key] = value;

      // Derive webpack entries from build file paths
      const jsFiles = Object.keys(value.js || {});
      const cssFiles = Object.keys((value.css && value.css.theme) || {});

      const outputBaseNames = new Set();
      for (const jsFile of jsFiles) {
        const match = jsFile.match(/^build\/js\/(.+)\.js$/);
        if (match) outputBaseNames.add(match[1]);
      }
      for (const cssFile of cssFiles) {
        const match = cssFile.match(/^build\/css\/(.+)\.css$/);
        if (match) outputBaseNames.add(match[1]);
      }

      for (const baseName of outputBaseNames) {
        const tsPath = path.join(componentDir, `${baseName}.ts`);
        const scssPath = path.join(componentDir, `${baseName}.scss`);
        const entryParts = [];

        if (fs.existsSync(tsPath)) entryParts.push(tsPath);
        if (fs.existsSync(scssPath)) entryParts.push(scssPath);

        if (entryParts.length) {
          componentEntries[baseName] = entryParts;
        }
      }
    }
  }

  // Update theme libraries file
  const themeLibrariesText = fs.readFileSync(THEME_LIBRARIES_FILE, 'utf8');
  const generatedBlock = buildGeneratedBlock(merged);
  const updated = replaceBetweenMarkers(themeLibrariesText, generatedBlock);

  if (updated !== themeLibrariesText) {
    fs.writeFileSync(THEME_LIBRARIES_FILE, updated, 'utf8');
  }

  // Write webpack entries manifest
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  fs.writeFileSync(
    GENERATED_COMPONENT_ENTRIES_FILE,
    `${JSON.stringify(componentEntries, null, 2)}\n`,
    'utf8',
  );

  // eslint-disable-next-line no-console
  console.log(`Generated ${Object.keys(merged).length} component library(s), ${Object.keys(componentEntries).length} webpack entry(s).`);
}

main();
