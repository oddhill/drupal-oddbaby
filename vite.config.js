import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load auto-generated component entries (created by scripts/generate-component-libraries.js)
let componentEntries = {};
try {
  componentEntries = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './scripts/.generated/component-entries.json'), 'utf-8')
  );
} catch (e) {
  // No components yet or first run - that's okay
  console.log('No component entries found yet. Run webpack once to generate them.');
}

// Discover all JS files in src/js recursively
function findJsFiles(dir, basePath = '') {
  const jsFiles = {};
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const entryKey = basePath ? `${basePath}/${item.name.replace('.js', '')}` : item.name.replace('.js', '');
    
    if (item.isDirectory()) {
      // Recurse into subdirectories
      Object.assign(jsFiles, findJsFiles(fullPath, entryKey));
    } else if (item.isFile() && item.name.endsWith('.js')) {
      jsFiles[entryKey] = fullPath;
    }
  }
  return jsFiles;
}

const jsFileEntries = findJsFiles(path.resolve(__dirname, './src/js'));

// Build entry points - separate entry for each stylesheet to get separate CSS files
const entries = {
  main: path.resolve(__dirname, './src/js/main.ts'),
  main_css: path.resolve(__dirname, './src/css-entries/main.ts'),
  print_css: path.resolve(__dirname, './src/css-entries/print.ts'),
  ckeditor_css: path.resolve(__dirname, './src/css-entries/ckeditor.ts'),
  ...jsFileEntries,
  ...Object.fromEntries(
    Object.entries(componentEntries).map(([key, val]) => [
      key,
      path.resolve(__dirname, './src', Array.isArray(val) ? val[0] : val),
    ])
  ),
};


// Filter entries - no longer needed since we use wrapper files
const rollupInput = entries;

export default defineConfig(({ command, mode }) => {
  const isDev = mode === 'development';

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      {
        name: 'remove-empty-js',
        apply: 'build',
        generateBundle(options, bundle) {
          // Remove JS files created by CSS-only entries (main_css, ckeditor, print)
          Object.keys(bundle).forEach((fileName) => {
            const file = bundle[fileName];
            // Check if it's a JS file with minimal content (just export {})
            if (fileName.endsWith('.js') && 
                (file.code === '' || file.code.length < 50) &&
                (fileName.includes('main'))) {
              delete bundle[fileName];
            }
          });
        },
      },
    ],
    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: isDev, // Only generate sourcemaps in dev mode (watch)
      minify: !isDev ? 'esbuild' : false,
      target: 'es2020',
      reportCompressedSize: false,
      assetsInlineLimit: 0, // Disable inlining - keep all assets as separate files for better cache control
      rollupOptions: {
        input: rollupInput,
        external: ['jquery'], // jQuery is provided by Drupal globally
        output: {
          // Output multiple files based on input entry points
          dir: 'build',
          entryFileNames: (chunkInfo) => {
            // Strip _css suffix from CSS entry points
            const name = chunkInfo.name.replace(/_css$/, '');
            return `js/${name}.js`;
          },
          assetFileNames: (assetInfo) => {
            // Safety check for asset name
            let name = assetInfo.name || '';
            
            // CSS files go to css/ directory - strip _css suffix
            if (name.endsWith('.css')) {
              name = name.replace(/_css\.css$/, '.css');
              return `css/${name}`;
            }
            // Fonts to fonts/, images to graphics/
            if (name.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
              return 'fonts/[hash][extname]';
            }
            if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
              return 'graphics/[hash][extname]';
            }
            return '[name][extname]';
          },
          chunkFileNames: 'js/[name].[hash].js',
          format: 'es', // ES modules instead of IIFE for better multi-entry support
          // Provide jQuery from global scope
          globals: {
            jquery: 'jQuery',
          },
        },
      },
    },
    // CSS handling with sourcemaps
    css: {
      devSourcemap: true, // Enable CSS source maps during development
      preprocessorOptions: {
        scss: {
          // Suppress deprecation warnings if using newer Sass
          quietDeps: true,
        },
      },
      postcss: path.resolve(__dirname, './postcss.config.js'),
    },
    // Vite asset handling - automatically discover assets in src folder
    assetsInclude: ['src/**/*.{woff,woff2,ttf,eot,otf,jpg,jpeg,png,gif,webp,svg}'],
  };
});
