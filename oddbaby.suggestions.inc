<?php

declare(strict_types=1);

use Drupal;

/**
 * @file
 * This file contains additional theme suggestions added by the theme.
 */

/**
 * Adds theme suggestions for field templates.
 *
 * Implements hook_theme_suggestions_HOOK().
 */
function oddbaby_theme_suggestions_field_alter(array &$suggestions, array $variables): void {
  $element = $variables['element'];

  // Add the view mode to the field theme suggestion.
  if (isset($element['#view_mode'])) {
    $suggestions[] = implode('__', [
      'field',
      $element['#entity_type'],
      $element['#field_name'],
      $element['#bundle'],
      $element['#view_mode'],
    ]);
  }
}

/**
 * Adds theme suggestions for the page title based on the current route.
 *
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function oddbaby_theme_suggestions_page_title_alter(array &$suggestions): void {
  $path_args = [''];

  if (!Drupal::service('path.matcher')->isFrontPage()) {
    $path_args = explode('/', ltrim(Drupal::service('path.current')->getPath(), '/'));
  }

  $page_title_suggestions = theme_get_suggestions($path_args, 'page_title');
  $suggestions = array_merge($suggestions, $page_title_suggestions);
}

/**
 * Adds theme suggestions for taxonomy term templates.
 *
 * Implements hook_theme_suggestions_HOOK().
 */
function oddbaby_theme_suggestions_taxonomy_term_alter(array &$suggestions, array $variables): void {
  /** @var \Drupal\taxonomy\TermInterface $term */
  $term = $variables['elements']['#taxonomy_term'];
  $view_mode = $variables['elements']['#view_mode'];

  // Add theme suggestions for taxonomy terms.
  $suggestions[] = 'taxonomy_term__' . $view_mode;
  $suggestions[] = 'taxonomy_term__' . $term->bundle() . '__' . $view_mode;
}

/**
 * Adds theme suggestions for view templates.
 *
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function oddbaby_theme_suggestions_views_view_alter(array &$suggestions, array $variables): void {
  /** @var \Drupal\views\ViewExecutable $view_executable */
  $view_executable = $variables['view'];

  // Add theme suggestions for taxonomy terms.
  $suggestions[] = 'views_view__' . $view_executable->id();
  $suggestions[] = 'views_view__' . $view_executable->id() . '__' . $view_executable->current_display;
}

/**
 * Adds theme suggestions for the unformatted view template.
 *
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function oddbaby_theme_suggestions_views_view_unformatted_alter(array &$suggestions, array $variables): void {
  /** @var \Drupal\views\ViewExecutable $view */
  $view = $variables['view'];

  $suggestions[] = 'views_view_unformatted__' . $view->id();
  $suggestions[] = 'views_view_unformatted__' . $view->id() . '__' . $view->current_display;
}

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function oddbaby_theme_suggestions_user_alter(array &$suggestions, array $variables): void {
  $element = $variables['elements'];

  // Add a theme suggestion to the user template with the view mode.
  if (isset($element['#view_mode'])) {
    $suggestions[] = 'user__' . $element['#view_mode'];
  }
}
