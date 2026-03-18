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
  processStyles(inputData);
} else {
  // Read from stdin
  process.stdin.on('data', chunk => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    processStyles(inputData);
  });
}

function processStyles(data) {
  try {
    const styleData = JSON.parse(data);
    
    // Generate SCSS from styles
    const scss = generateScss(styleData);
    
    // Define output path
    const outputPath = path.join(__dirname, '..', 'src', 'scss', '_typography.scss');
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write SCSS file
    fs.writeFileSync(outputPath, scss, 'utf-8');
    
    console.log(`✅ Generated typography SCSS`);
    console.log(`📁 File: ${outputPath}`);
    
    if (styleData.textStyles?.length) {
      console.log(`📊 Typography styles exported: ${styleData.textStyles.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error processing styles:', error.message);
    process.exit(1);
  }
}

function generateScss(styleData) {
  let scss = '// Auto-generated typography styles from Figma\n';
  scss += `// Generated: ${new Date().toISOString()}\n`;
  scss += '// Do not edit manually - regenerate from Figma plugin\n\n';
  
  if (!styleData.textStyles || styleData.textStyles.length === 0) {
    scss += '// No text styles found\n';
    return scss;
  }
  
  // Group styles by base name (without breakpoint suffix)
  const groupedStyles = groupStylesByBaseName(styleData.textStyles);
  
  scss += '// Typography Classes - Mobile First\n';
  scss += '// Usage: <p class="heading-1">Text</p>\n\n';
  
  // Generate placeholder classes for shared properties
  const placeholders = generatePlaceholders(groupedStyles);
  scss += placeholders + '\n';
  
  // Generate responsive classes
  for (const [baseName, variants] of Object.entries(groupedStyles)) {
    scss += generateResponsiveClass(baseName, variants) + '\n';
  }
  
  return scss;
}

function groupStylesByBaseName(styles) {
  const grouped = {};
  
  styles.forEach(style => {
    // Extract base name and breakpoint
    const { baseName, breakpoint } = extractBaseName(style.name);
    
    if (!grouped[baseName]) {
      grouped[baseName] = {};
    }
    
    grouped[baseName][breakpoint] = style;
  });
  
  return grouped;
}

function extractBaseName(name) {
  const lowerName = name.toLowerCase();
  
  // Check for breakpoint suffixes
  const breakpoints = ['desktop', 'mobile', 'xl', 'mbile']; // Include typo for compatibility
  
  for (const bp of breakpoints) {
    if (lowerName.endsWith('/' + bp) || lowerName.endsWith('-' + bp)) {
      const baseName = name.substring(0, name.length - bp.length - 1);
      return { baseName, breakpoint: bp };
    }
  }
  
  return { baseName: name, breakpoint: 'default' };
}

function generatePlaceholders(groupedStyles) {
  let scss = '// Base typography styles\n';
  
  for (const [baseName, variants] of Object.entries(groupedStyles)) {
    // Find common properties across all variants
    const commonProps = findCommonProperties(variants);
    
    if (Object.keys(commonProps).length > 0) {
      const placeholderName = styleNameToClass(baseName);
      scss += `%${placeholderName}-base {\n`;
      
      if (commonProps.fontFamily) {
        scss += `  font-family: '${commonProps.fontFamily}';\n`;
      }
      if (commonProps.fontWeight) {
        scss += `  font-weight: ${fontWeightToNumber(commonProps.fontWeight)};\n`;
      }
      if (commonProps.letterSpacing !== undefined) {
        scss += `  letter-spacing: ${commonProps.letterSpacing.value}${commonProps.letterSpacing.unit === 'PERCENT' ? '%' : 'px'};\n`;
      }
      if (commonProps.textCase && commonProps.textCase !== 'ORIGINAL') {
        const transform = commonProps.textCase === 'UPPER' ? 'uppercase' : commonProps.textCase === 'LOWER' ? 'lowercase' : 'capitalize';
        scss += `  text-transform: ${transform};\n`;
      }
      if (commonProps.lineHeight) {
        scss += `  line-height: ${commonProps.lineHeight};\n`;
      }
      
      scss += '}\n\n';
    }
  }
  
  return scss;
}

function findCommonProperties(variants) {
  const keys = Object.keys(variants);
  if (keys.length === 0) return {};
  
  const props = {};
  const firstVariant = variants[keys[0]];
  
  // Check which properties are the same across all variants
  ['fontFamily', 'fontWeight', 'letterSpacing', 'textCase', 'lineHeight'].forEach(prop => {
    const values = keys.map(k => JSON.stringify(variants[k][prop]));
    if (values.every(v => v === values[0])) {
      props[prop] = firstVariant[prop];
    }
  });
  
  return props;
}

function generateResponsiveClass(baseName, variants) {
  const className = styleNameToClass(baseName);
  const placeholderName = className.replace(/-/g, '-').substring(0);
  
  let scss = `.${className} {\n`;
  scss += `  @extend %${placeholderName}-base;\n`;
  
  // Sort breakpoints: mobile first, then desktop, then xl
  const breakpointOrder = ['default', 'mobile', 'tablet', 'desktop', 'xl', 'mbile'];
  const sortedBreakpoints = Object.keys(variants).sort((a, b) => {
    return breakpointOrder.indexOf(a) - breakpointOrder.indexOf(b);
  });
  
  // First breakpoint (mobile) goes in the base class
  const firstBp = sortedBreakpoints[0];
  const firstVariant = variants[firstBp];
  if (firstVariant.fontSize) {
    scss += `  font-size: ${formatRem(firstVariant.fontSize)}rem;\n`;
  }
  
  // Other breakpoints go in media queries
  for (let i = 1; i < sortedBreakpoints.length; i++) {
    const bp = sortedBreakpoints[i];
    const variant = variants[bp];
    
    const media = getMediaQuery(bp);
    if (media) {
      scss += `\n  ${media} {\n`;
      if (variant.fontSize && variant.fontSize !== firstVariant.fontSize) {
        scss += `    font-size: ${formatRem(variant.fontSize)}rem;\n`;
      }
      scss += `  }\n`;
    }
  }
  
  scss += '}\n';
  return scss;
}

function getMediaQuery(breakpoint) {
  // Map breakpoint names to their corresponding SCSS mixin
  const queries = {
    'mobile': null, // mobile is default
    'tablet': '@media (min-width: $breakpoint-tablet)',
    'desktop': '@media (min-width: $breakpoint-desktop)',
    'xl': '@media (min-width: $breakpoint-xl)',
    'mbile': null, // typo, skip
    'default': null
  };
  
  return queries[breakpoint] || null;
}

function styleNameToClass(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces to dashes
    .replace(/\//g, '-')            // slashes to dashes
    .replace(/[^a-z0-9-]/g, '')     // remove special chars
    .replace(/^-+|-+$/g, '');       // trim dashes
}

function fontWeightToNumber(weightName) {
  const weights = {
    'thin': 100,
    'extra light': 200,
    'light': 300,
    'normal': 400,
    'regular': 400,
    'medium': 500,
    'semi bold': 600,
    'bold': 700,
    'extra bold': 800,
    'black': 900
  };
  
  const lowerName = weightName.toLowerCase();
  
  // Check for exact matches
  for (const [key, value] of Object.entries(weights)) {
    if (lowerName === key) {
      return value;
    }
  }
  
  // Check for partial matches (e.g., "Regular Italic" -> "Regular")
  for (const [key, value] of Object.entries(weights)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Default to regular
  return 400;
}

function formatRem(value) {
  const rem = value / 16;
  // Remove trailing zeros and unnecessary decimal point
  return parseFloat(rem.toFixed(3)).toString();
}
