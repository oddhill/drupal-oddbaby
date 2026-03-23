# Vite Configuration Guide

This document explains the Vite build setup for the OddBaby Drupal theme and key considerations when modifying it.

## Overview

The theme uses **Vite 8.0.1** with a **multi-entry point setup** to generate separate CSS and JavaScript bundles for:
- Global theme styles and scripts
- Component-specific styles and scripts
- Print and CKEditor-specific styles

All bundles are registered as Drupal libraries in `oddbaby.libraries.yml` and loaded on-demand by components.

## Entry Points

### Primary Entries

1. **Main Theme Bundle** (`src/js/main.ts`)
   - Output: `build/js/main.js`
   - Includes: Global JavaScript, polyfills, utilities
   - Referenced in `oddbaby.libraries.yml` as `theme/main`

2. **Main CSS** (`src/css-entries/main.ts`)
   - Output: `build/css/main.css`
   - Imports: `src/scss/main.scss` (all component SCSS)
   - Registered as `theme/main-css`

3. **Print CSS** (`src/css-entries/print.ts`)
   - Output: `build/css/print.css`
   - Imports: `src/scss/print.scss`

4. **CKEditor CSS** (`src/css-entries/ckeditor.ts`)
   - Output: `build/css/ckeditor.css`
   - Imports: `src/scss/ckeditor.scss`

### Discovered Entries

- **JS Files**: All `.js` files in `src/js/` (recursive) are auto-discovered and bundled separately
- **Component Bundles**: Auto-generated from `templates/components/*/component.libraries.yml` by `scripts/generate-component-libraries.js`
  - Creates separate JS and CSS bundles for each component
  - Output: `build/js/[component-name].js` and `build/css/[component-name].css`

## CSS Entry Files (Important!)

The `.ts` files in `src/css-entries/` are **wrapper entry points** that tell Vite which SCSS files to build into CSS bundles.

**They must import their corresponding SCSS files for the CSS to be built.**

### Example Structure

**File**: `src/css-entries/main.ts`
```typescript
// This import is required for Vite to process the SCSS and generate main.css
import '../scss/main.scss';
```

**File**: `src/scss/main.scss`
```scss
@use 'normalize.css/normalize';
@use './general/general';
@use './components/button';
// ... all your actual styles
```

**Without the import in the .ts file**, Vite won't know to compile that SCSS, and no CSS file will be generated.

### When to Create New CSS Entries

1. Add a new `.ts` file in `src/css-entries/` (e.g., `special.ts`)
2. Import your SCSS file: `import '../scss/special.scss';`
3. Vite will automatically detect it and add it to the build
4. Register the new bundle in `oddbaby.libraries.yml`

## Asset Handling

### Hashed Assets (Cache Busting)

**Purpose**: Automatically cache-busted for long-term caching

**Location**: `src/assets/`
- `src/assets/graphics/*.{jpg,png,gif,svg,webp}`
- `src/assets/fonts/*.{woff,woff2,ttf,eot,otf}`

**Usage in SCSS**:
```scss
background: url('../assets/graphics/logo.png');
// Outputs: background: url(../graphics/logo.[hash].png);
```

**Output**:
- Images: `build/graphics/[name].[hash].[ext]`
- Fonts: `build/fonts/[name].[hash].[ext]`

### Static Assets (No Hashing)

**Purpose**: Static file copies from the public folder

**Location**: `src/public/`
- `src/public/graphics/`
- `src/public/fonts/`
- Any other static files

**Usage in SCSS**:
```scss
background: url('/graphics/logo.png');
// Outputs: background: url(/graphics/logo.png);
```

**Output**: Copies directory structure as-is to `build/`
- `src/public/graphics/logo.png` → `build/graphics/logo.png`

## Output Structure

```
build/
├── js/
│   ├── main.js                    # Main theme JS
│   ├── [component-name].js        # Component-specific JS
│   └── [other-js-files].js        # Additional JS entries
├── css/
│   ├── main.css                   # Main theme CSS
│   ├── print.css                  # Print styles
│   ├── ckeditor.css               # CKEditor styles
│   ├── [component-name].css       # Component-specific CSS
│   └── [other-entry].css
├── graphics/                      # Images (hashed + static)
│   ├── [name].[hash].png          # Hashed from src/assets/
│   └── static-image.png           # Static from src/public/
└── fonts/                         # Fonts (hashed + static)
    ├── [name].[hash].woff2        # Hashed from src/assets/
    └── static-font.woff2          # Static from src/public/
```

## Configuration Details

### publicDir
- **Current**: `src/public/`
- **Purpose**: Copies all files directly to build output without processing
- **Modify**: Change in `vite.config.js` if you move the public folder

### Aliases
- `@` → `src/`
- `~` → `src/`
- Usage: `@/components/button.scss` or `~/assets/graphics/logo.png`

### CSS Handling
- **PostCSS**: Configured via `postcss.config.js` (includes Autoprefixer)
- **Sass**: Options in `vite.config.js` under `css.preprocessorOptions.scss`
- **Source Maps**: Enabled in development mode for debugging

### Rollup Output
- **Format**: ES modules (`format: 'es'`)
- **Multiple Entries**: Each entry point generates separate bundles
- **jQuery**: Marked as external (provided by Drupal globally)
- **Asset Naming**: Images/fonts use hashes for cache busting

## Build Commands

```bash
# Development (watch mode with source maps)
yarn start

# Production build (minified, no source maps)
yarn build

# Check Sass files
yarn stylelint

# Check JavaScript
yarn eslint
```

## Key Considerations When Modifying

### Adding New Entry Points

1. **Global JavaScript**: Add to `src/js/` (auto-discovered)
   
2. **Component JavaScript**: Add via `component.libraries.yml` in component folder

3. **Global CSS**: 
   - Option A: Add `@use` statement to `src/scss/main.scss` (included in main build)
   - Option B: Create new CSS entry:
     - Add `src/css-entries/[name].ts` with `import '../scss/[name].scss';`
     - Create `src/scss/[name].scss` with your styles
     - Vite will auto-detect and build it to `build/css/[name].css`

4. **Component CSS**: 
   - Add `@use` statement in component's SCSS file
   - Imported via main.scss or component-specific entry

### Adding Assets

**For cache-busting** (versioned URLs):
- Place in `src/assets/graphics/` or `src/assets/fonts/`
- Import/reference in SCSS with relative paths
- Example: `url('../assets/graphics/logo.png')`

**For static URLs** (same filename every time):
- Place in `src/public/graphics/` or `src/public/fonts/`
- Reference in SCSS with absolute paths
- Example: `url('/graphics/logo.png')`

### Modifying Build Output

- **Output directory**: `build/` (configured in `vite.config.js`)
- **Entry file naming**: `build/js/[name].js`
- **Asset file naming**: `build/[type]/[hash].[ext]`
- Changes should be made in `rollupOptions.output` section

### Drupal Integration

- **Library Registration**: Add bundles to `oddbaby.libraries.yml`
- **Dependency Declaration**: Declare Drupal libraries (drupal/core, drupal/once, etc.)
- **Component Structure**: Each component folder can have its own `component.libraries.yml`
- **Auto-generation**: Run `scripts/generate-component-libraries.js` before each build

### Troubleshooting

**Public folder files not copying:**
- Verify `publicDir` points to correct location in `vite.config.js`
- Check files exist in source folder
- Run `yarn build` to regenerate

**Images not hashing:**
- Ensure images are in `src/assets/`, not `src/public/`
- Verify they're referenced (imported/URL'd) in CSS or JS
- Check console output for any build errors

**CSS not updated in watch mode:**
- ESM source maps can be slow; check `devSourcemap` setting
- Try hard-refresh or clear browser cache
- Restart `yarn start` if needed

## Node Version

- **Required**: Node 22.x (configured in `package.json`)
- **Issue**: Node 20.x may have compatibility issues with Yarn PnP and Vite 8.0.1
