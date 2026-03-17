# Odd Baby

Starter for creating new themes for Drupal 10 and 11 sites.

This starter contains everything you might need to create a bare bones theme
with some basic configuration provided out of the box.

## Requirements

- [Node.js](https://nodejs.org/en/) (Version 22)
- [Yarn](https://yarnpkg.com/en/)

## Getting started

Start by downloading the theme as a zip file from Github and unpackage it and
place in in the themes folder of your Drupal project.

The first thing you should do after you've placed the theme in your Drupal project
is to decide on a name for your theme and then rename all files and folders that
currently have the oddbaby name. You will also have to change the name of
functions, breakpoints and more.

When you are done with the previous steps you can install the required packages
by running the following command.

```
yarn install
```

## Setting Up Custom Component Modules

If you're using the custom component modules included in `modules/components/` (such as `button_link`, `paragraph_media_with_text`, and `paragraph_promo`), you need to set them up in your Drupal installation:

1. **Copy the modules to your Drupal installation:**
   ```bash
   cp -r modules/components public/modules/custom/
   ```

2. **Install the field_group dependency:**
   ```bash
   composer require 'drupal/field_group:^4.0'
   ```

3. **Enable the modules in Drupal:**
   ```bash
   drush pm:enable button_link paragraph_media_with_text paragraph_promo
   ```

## Usage

While developing you generally want changes to the CSS and JavaScript to be
built automatically. For this purpose you can use the `start` command, this will
start webpack and watch for changes in any of the files located in the `src`
folder.

```
yarn start
```

## Commands

<!-- prettier-ignore-start -->
Command       | Description
--------------|------------
start         | Compiles the CSS and JavaScript and outputs the result to the build folder and also watches for any additional changes to the source file and rebuilds automatically. This should only be used in development.
build         | Builds the CSS and JavaScript for the production environment. This will output a minified and optimized version of the CSS and JavaScript with source maps for easier debugging.
eslint        | Runs eslint and outputs the result to the terminal.
eslint-ci     | Runs eslint and outputs the result to an XML file that can be used in the CI environment.
stylelint     | Runs stylelint and outputs the result to the terminal.
stylelint-ci  | Runs stylelint and outputs the result to an XML file that can be used in the CI environment.
<!-- prettier-ignore-end -->

## Setup: Drupal settings.php Configuration (Required for Font Awesome Kit)

To enable theme-level environment variable loading for **Font Awesome Kit Integration**, you need to add code to your Drupal `settings.php` file.

### Adding Theme-Level .env Support

1. Reference the included `settings.example.php` file in this theme directory
2. Copy the code block from `settings.example.php`
3. Paste it into your Drupal installation's `settings.php` file (typically at `public/sites/default/settings.php`)
4. Save the file

Once added, the code will run on every request and automatically load `.env` files from all theme directories. This is **essential** for Font Awesome Kit and other theme modules that depend on environment variables during Drupal's bootstrap process.

**Note:** This setup is a prerequisite for the Font Awesome Kit Integration steps below.

## Font Awesome Kit Integration

The site uses **Font Awesome Pro Kit** for icon selection. Font Awesome CSS is loaded globally on every page, making icons available throughout the site.

### Icon Picker UI vs. Manual Usage

- **Icon Picker UI** (interactive widget): Available only in the `button_link`, `paragraph_media_with_text`, and `paragraph_promo` modules
- **Manual Font Awesome classes**: Can be used anywhere in any template by using Font Awesome class names directly (e.g., `fa-solid fa-icon-name`)

### Configuration

Configure your Font Awesome kit via environment variables in the `.env` file:

```bash
# Your Font Awesome Kit URL (get from https://kit.fontawesome.com/)
FONT_AWESOME_KIT_URL=https://kit.fontawesome.com/YOUR_KIT_ID.js

```

**Before proceeding:** Make sure you've completed the [Setup: Drupal settings.php Configuration](#setup-drupal-settingsphp-configuration) section to enable `.env` file loading.

### Initial Setup

After you've configured the `FONT_AWESOME_KIT_URL` in your `.env` file, run the following command to install and sync the kit:

```bash
vendor/bin/drush ev "button_link_post_update_sync_fontawesome_kit();"
```

This will fetch and install your Font Awesome Kit npm package. The icons will then be available in the icon picker within the admin UI for use in the `button_link`, `paragraph_media_with_text`, and `paragraph_promo` modules.

### Switching Kits or Adding New Icons

**To use a different Font Awesome kit:**

1. Update the `FONT_AWESOME_KIT_URL` in `.env` to point to your kit
2. Rebuild cache, sync the kit package, then rebuild cache again:
   ```bash
   vendor/bin/drush cr
   vendor/bin/drush ev "button_link_post_update_sync_fontawesome_kit();"
   vendor/bin/drush cr
   ```

`drush cr` alone does not switch the npm kit package in `node_modules`; run the sync command whenever the kit ID changes.

**After adding or deleting icons to your FA kit:**

1. Run the kit package update:
   ```bash
   cd public/themes/custom/{THEME_NAME}
   yarn add @awesome.me/kit-YOUR_KIT_ID@latest
   ```
   (Replace `YOUR_KIT_ID` with the ID from your kit URL)

2. Clear caches:
   ```bash
   drush cache:rebuild
   ```

The new icons will appear in the icon picker.

### How It Works

**Configuration Flow:**

1. `.env` file contains `FONT_AWESOME_KIT_URL`
2. `settings.php` (with code from `settings.example.php`) loads the `.env` file into `$_SERVER`
3. `oddbaby.theme` (around line 19) reads `$_SERVER['FONT_AWESOME_KIT_URL']` and passes it to Drupal's config system for `button_link.settings`
4. `button_link` module uses the configured kit URL to load icons

**Backend Components:**

- **`oddbaby.theme`** - Bridges environment variable to Drupal config
- **`FontAwesomeKitIconProvider.php`** - Reads icons from the local npm package `@awesome.me/kit-*` (installed in `public/themes/custom/{THEME_NAME}/node_modules/`)
- **`icon-picker.js`** - Provides searchable UI widget for selecting icons
- **Endpoint** - `/button-link/fontawesome-kit-icons.json` returns available icons

**Icon Styles:**

Properly prefixed icon class names:
  - Duotone: `fa-duotone fa-solid fa-{icon}`
  - Classic solid: `fa-classic fa-solid fa-{icon}`
  - Classic regular: `fa-classic fa-regular fa-{icon}`
  - Classic light: `fa-classic fa-light fa-{icon}`
  - Classic thin: `fa-classic fa-thin fa-{icon}`
  - Brands: `fa-brands fa-{icon}`

# Font Awesome Icons in CKEditor 5

CKEditor 5 strips empty inline elements. To use Font Awesome icons in text fields, add a zero-width non-joiner character (`&zwnj;`) inside the `<i>` tag:

```html
<i class="fa-duotone fa-solid fa-air-conditioner">&zwnj;</i>
```

This prevents the tag from being treated as empty and getting removed during rendering.
