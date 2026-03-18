#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON from stdin or from file argument
let inputData = '';

if (process.argv[2]) {
  // If file path provided as argument
  inputData = fs.readFileSync(process.argv[2], 'utf-8');
  processTokens(inputData);
} else {
  // Read from stdin
  process.stdin.on('data', chunk => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    processTokens(inputData);
  });
}

function processTokens(data) {
  try {
    const input = JSON.parse(data);
    let tokens;
    
    // Check if it's Tokens Studio format or our custom format
    if (input.variables) {
      // Our custom format
      tokens = input;
    } else if (Object.keys(input).some(key => input[key].color || input[key].breakpoint)) {
      // Tokens Studio format - flatten the nested structure
      tokens = flattenTokensStudioFormat(input);
    } else {
      throw new Error('Unknown token format');
    }
    
    // Generate SCSS from tokens
    const scss = generateScss(tokens);
    
    // Define output path in theme src/scss
    const outputPath = path.join(__dirname, '..', 'src', 'scss', '_design-tokens.scss');
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write SCSS file
    fs.writeFileSync(outputPath, scss, 'utf-8');
    
    console.log(`✅ Generated design tokens SCSS`);
    console.log(`📁 File: ${outputPath}`);
    console.log(`📊 Tokens exported:`);
    
    if (tokens.variables?.length) {
      console.log(`   - ${tokens.variables.length} variables`);
    }
    if (tokens.components?.length) {
      console.log(`   - ${tokens.components.length} components`);
    }
    if (tokens.styles?.length) {
      console.log(`   - ${tokens.styles.length} styles`);
    }
    
  } catch (error) {
    console.error('❌ Error processing tokens:', error.message);
    process.exit(1);
  }
}

function flattenTokensStudioFormat(input) {
  const variables = [];
  
  // Iterate through collections (e.g., "collection-mode 1")
  for (const [collectionName, collection] of Object.entries(input)) {
    // Iterate through groups (e.g., "color", "breakpoint", "typography")
    for (const [groupName, group] of Object.entries(collection)) {
      traverseTokenGroup(groupName, group, variables);
    }
  }
  
  return {
    variables: variables,
    components: [],
    styles: []
  };
}

function traverseTokenGroup(path, obj, variables) {
  for (const [key, val] of Object.entries(obj)) {
    // Check if this is a token (has value and type)
    if (val.value !== undefined && val.type) {
      variables.push({
        name: `${path}/${key}`,
        type: val.type.toUpperCase(),
        value: cleanTokenValue(val.value, val.type),
        description: val.description || ''
      });
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      // Recurse into nested objects
      traverseTokenGroup(`${path}/${key}`, val, variables);
    }
  }
}

function cleanTokenValue(value, type) {
  if (type === 'color' && typeof value === 'string') {
    // Remove alpha channel if present (e.g., #FF9900FF -> #FF9900)
    return value.substring(0, 7);
  }
  return value.toString();
}

function generateScss(tokens) {
  let scss = '// Auto-generated design tokens from Figma\n';
  scss += `// Generated: ${new Date().toISOString()}\n`;
  scss += '// Do not edit manually - regenerate from Figma plugin\n\n';
  
  // Process variables by type
  if (tokens.variables && tokens.variables.length > 0) {
    // Separate breakpoints from other variables
    const breakpointVars = tokens.variables.filter(v => v.name.toLowerCase().includes('breakpoint'));
    const colorVars = tokens.variables.filter(v => v.type === 'COLOR' && !v.name.toLowerCase().includes('breakpoint'));
    const numberVars = tokens.variables.filter(v => v.type === 'FLOAT' && !v.name.toLowerCase().includes('breakpoint'));
    const stringVars = tokens.variables.filter(v => v.type === 'STRING' && !v.name.toLowerCase().includes('breakpoint'));
    const boolVars = tokens.variables.filter(v => v.type === 'BOOLEAN');
    
    // Breakpoints
    if (breakpointVars.length > 0) {
      scss += '// === Breakpoints ===\n';
      breakpointVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        scss += `$${varName}: ${v.value}px; // ${v.description || v.name}\n`;
      });
      scss += '\n';
      
      // Generate breakpoint mixins
      scss += '// Breakpoint mixins\n';
      breakpointVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        // Extract just the breakpoint name (e.g., "mobile" from "breakpoint-mobile")
        const mixinName = varName.replace(/^breakpoint-/, '');
        scss += `@mixin ${mixinName} {\n`;
        scss += `  @media (min-width: $${varName}) {\n`;
        scss += `    @content;\n`;
        scss += `  }\n`;
        scss += `}\n`;
      });
      scss += '\n';
    }
    
    // Colors
    if (colorVars.length > 0) {
      scss += '// === Colors ===\n';
      colorVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        scss += `$${varName}: ${v.value}; // ${v.description || v.name}\n`;
      });
      scss += '\n';
    }
    
    // Numbers/Spacing
    if (numberVars.length > 0) {
      scss += '// === Spacing & Numbers ===\n';
      numberVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        // Add px to font-size and spacing related vars
        const isSizeVar = v.name.toLowerCase().includes('font-size') || v.name.toLowerCase().includes('spacing') || v.name.toLowerCase().includes('size');
        const value = isSizeVar ? `${v.value}px` : v.value;
        scss += `$${varName}: ${value}; // ${v.description || v.name}\n`;
      });
      scss += '\n';
    }
    
    // Strings
    if (stringVars.length > 0) {
      scss += '// === Typography & Strings ===\n';
      stringVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        scss += `$${varName}: '${v.value}'; // ${v.description || v.name}\n`;
      });
      scss += '\n';
    }
    
    // Booleans
    if (boolVars.length > 0) {
      scss += '// === Booleans ===\n';
      boolVars.forEach(v => {
        const varName = tokenToScssVariable(v.name);
        scss += `// $${varName}: ${v.value}; // ${v.description || v.name}\n`;
      });
      scss += '\n';
    }
  }
  
  return scss;
}

function tokenToScssVariable(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces to dashes
    .replace(/\//g, '-')            // slashes to dashes
    .replace(/[^a-z0-9-]/g, '')     // remove special chars
    .replace(/^-+|-+$/g, '');       // trim dashes
}

