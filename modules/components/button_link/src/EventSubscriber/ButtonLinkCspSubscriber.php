<?php

declare(strict_types=1);

namespace Drupal\button_link\EventSubscriber;

use Drupal\csp\CspEvents;
use Drupal\csp\Event\PolicyAlterEvent;
use Drupal\csp\Csp;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ButtonLinkCspSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      CspEvents::POLICY_ALTER => ['onPolicyAlter'],
    ];
  }

  /**
   * Alter CSP policy.
   */
  public function onPolicyAlter(PolicyAlterEvent $event): void {
    // If using a Font Awesome Kit, allow only the specific kit host plus the
    // font host used by kits.
    //
    // If no kit is configured, Font Awesome stays same-origin via the theme.
    $kit_url = '';
    try {
      if (class_exists('\\Drupal') && \Drupal::hasContainer()) {
        $kit_url = (string) \Drupal::config('button_link.settings')->get('kit_url');
      }
    }
    catch (\Throwable $e) {
      $kit_url = '';
    }

    $kit_url = trim($kit_url);
    if ($kit_url === '') {
      return;
    }

    $host = (string) parse_url($kit_url, PHP_URL_HOST);
    if ($host === '') {
      return;
    }

    $sources = [
      'https://' . $host,
      // Common Font Awesome kit asset host (webfonts).
      'https://ka-f.fontawesome.com',
      // Common Font Awesome kit asset host (CSS bootstrap + kit.css).
      'https://ka-p.fontawesome.com',
    ];

    // Fonts can be delivered as data: URIs (or referenced from external hosts)
    // depending on kit configuration.
    $font_sources = array_merge($sources, [
      'data:',
      // Common Google Fonts host used by Gin/admin and some themes.
      'https://fonts.gstatic.com',
    ]);

    // If the site uses Google Fonts stylesheets, they come from this host.
    $style_sources = array_merge($sources, [
      'https://fonts.googleapis.com',
    ]);

    $policy = $event->getPolicy();

    // Make sure the kit script itself can load.
    $policy->fallbackAwareAppendIfEnabled('script-src-elem', $sources);
    $policy->fallbackAwareAppendIfEnabled('script-src', $sources);

    // Allow the kit to load its CSS and fonts.
    $policy->fallbackAwareAppendIfEnabled('style-src-elem', $style_sources);
    $policy->fallbackAwareAppendIfEnabled('style-src', $style_sources);
    $policy->fallbackAwareAppendIfEnabled('font-src', $font_sources);

    // Some kit modes fetch additional assets.
    $policy->fallbackAwareAppendIfEnabled('connect-src', $sources);
  }

}
