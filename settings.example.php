<?php

/**
 * @file
 * Example Drupal settings for loading theme-level environment variables.
 *
 * IMPORTANT: This file demonstrates how to configure your Drupal settings.php
 * to automatically load environment variables from theme directories.
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy the code block below (between the dashed lines)
 * 2. Paste it into your Drupal installation's settings.php file
 *    (typically at: public/sites/default/settings.php)
 * 3. Save the file
 *
 * This code will then run automatically on every request, loading .env files
 * from all theme directories. This is essential for modules like button_link
 * that depend on environment variables at bootstrap time.
 *
 * --- BEGIN: Copy this code block to settings.php ---
 */

/**
 * Load theme-level environment variables.
 *
 * Iterate through all theme directories and load their .env files.
 * This allows themes to define their own environment-specific settings.
 */
$theme_dirs = glob($app_root . '/themes/*/');
foreach ($theme_dirs as $theme_dir) {
  if (file_exists($theme_dir . '.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($theme_dir);
    $dotenv->load();
  }
}

/*
 * --- END: Copy this code block to settings.php ---
 */
