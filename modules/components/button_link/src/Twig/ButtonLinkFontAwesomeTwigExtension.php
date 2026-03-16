<?php

declare(strict_types=1);

namespace Drupal\button_link\Twig;

use Drupal\button_link\FontAwesomeKitIconProvider;
use Drupal\Core\Config\ConfigFactoryInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

final class ButtonLinkFontAwesomeTwigExtension extends AbstractExtension {

  public function __construct(
    private readonly FontAwesomeKitIconProvider $provider,
    private readonly ConfigFactoryInterface $configFactory,
  ) {}

  public function getFilters(): array {
    return [
      new TwigFilter('button_link_fa_classes', [$this, 'toFontAwesomeClasses']),
      new TwigFilter('button_link_fa_enabled', [$this, 'isFontAwesomeEnabled']),
    ];
  }

  /**
   * Check if Font Awesome is enabled by checking if kit URL is set in .env.
   */
  public function isFontAwesomeEnabled(): bool {
    $kitUrl = (string) $this->configFactory->get('button_link.settings')->get('kit_url');
    return !empty(trim($kitUrl));
  }

  /**
   * Convert a stored icon value into a renderable Font Awesome class string.
   *
   * Accepts:
   * - "fa-arrow-right" (icon-only)
   * - "fa-brands fa-x-twitter" (styleful)
   */
  public function toFontAwesomeClasses(?string $value): string {
    $value = trim((string) $value);
    if ($value === '') {
      return '';
    }

    $kitUrl = (string) $this->configFactory->get('button_link.settings')->get('kit_url');
    $kitUrl = trim($kitUrl);

    $defaultClassic = (string) $this->configFactory->get('button_link.settings')->get('default_classic_style');
    $defaultClassic = strtolower(trim($defaultClassic));
    if (!in_array($defaultClassic, ['solid', 'regular', 'duotone'], TRUE)) {
      $defaultClassic = 'solid';
    }

    $preferredClassicStyle = 'fa-' . $defaultClassic;
    $styleOrder = ['fa-brands', $preferredClassicStyle, 'fa-solid', 'fa-regular', 'fa-duotone'];
    $styleOrder = array_values(array_unique($styleOrder));

    // Already includes an explicit style class.
    if (preg_match('/\bfa-(solid|regular|brands|duotone|light|thin|sharp|sharp-solid|sharp-regular|sharp-light|sharp-thin|sharp-duotone)\b/i', $value)) {
      return $value;
    }

    // Not a Font Awesome class.
    if (!str_starts_with($value, 'fa-')) {
      return $value;
    }

    // Icon-only: if kit mode is enabled, map to a known styleful variant.
    if ($kitUrl !== '') {
      $lookup = [];
      static $cache = [];

      if (!isset($cache[$kitUrl])) {
        try {
          $icons = $this->provider->getIconsForKitUrl($kitUrl);
        }
        catch (\Throwable) {
          $icons = [];
        }
        $kitLookup = [];
        foreach ($icons as $icon) {
          if (is_string($icon) && $icon !== '') {
            $kitLookup[$icon] = TRUE;
          }
        }
        $cache[$kitUrl] = $kitLookup;
      }

      $lookup = $cache[$kitUrl];

      foreach ($styleOrder as $style) {
        $candidate = $style . ' ' . $value;
        if (isset($lookup[$candidate])) {
          return $candidate;
        }
      }

      // If not found in kit lookup, still use the preferred classic style.
      return $preferredClassicStyle . ' ' . $value;
    }

    // Non-kit fallback.
    return 'fa-solid ' . $value;
  }

}
