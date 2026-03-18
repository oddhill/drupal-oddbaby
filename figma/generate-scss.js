#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findLatestTokenFile(subfolder) {
  const tokenDir = path.join(__dirname, 'tokens', subfolder);
  
  try {
    if (!fs.existsSync(tokenDir)) {
      return null;
    }
    
    const files = fs.readdirSync(tokenDir);
    const tokenFiles = files.filter(f => f.endsWith('.json'));
    
    if (tokenFiles.length === 0) {
      return null;
    }
    
    // Look for specific file names first
    if (subfolder === 'variables' && tokenFiles.includes('design-tokens.json')) {
      return path.join(tokenDir, 'design-tokens.json');
    }
    if (subfolder === 'styles' && tokenFiles.includes('text-styles.json')) {
      return path.join(tokenDir, 'text-styles.json');
    }
    
    // Otherwise use latest
    tokenFiles.sort().reverse();
    return path.join(tokenDir, tokenFiles[0]);
  } catch (error) {
    console.error(`Error finding token file in ${subfolder}:`, error.message);
  }
  return null;
}

async function syncVariables() {
  const tokenFile = await findLatestTokenFile('variables');
  
  if (!tokenFile) {
    console.log('⏭️  No variables file found in figma/tokens/variables/');
    return;
  }
  
  console.log(`📁 Syncing variables from: ${path.basename(tokenFile)}`);
  
  try {
    const syncScript = path.join(__dirname, 'convert-figma-variables.js');
    const { stdout, stderr } = await execPromise(`node "${syncScript}" "${tokenFile}"`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('❌ Error syncing variables:', error.message);
  }
}

async function syncStyles() {
  const styleFile = await findLatestTokenFile('styles');
  
  if (!styleFile) {
    console.log('⏭️  No styles file found in figma/tokens/styles/');
    return;
  }
  
  console.log(`📁 Syncing styles from: ${path.basename(styleFile)}`);
  
  try {
    const syncScript = path.join(__dirname, 'convert-figma-styles.js');
    const { stdout, stderr } = await execPromise(`node "${syncScript}" "${styleFile}"`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('❌ Error syncing styles:', error.message);
  }
}

async function run() {
  console.log('🔄 Syncing Figma design tokens...\n');
  
  await syncVariables();
  await syncStyles();
  
  console.log('\n✅ Design sync complete!');
}

run();
