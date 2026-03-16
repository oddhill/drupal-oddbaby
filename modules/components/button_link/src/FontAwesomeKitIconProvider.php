<?php

declare(strict_types=1);

namespace Drupal\button_link;

use Drupal\Core\Config\ConfigFactoryInterface;
use GuzzleHttp\ClientInterface;

/**
 * Provides icon lists from Font Awesome kits.
 */
final class FontAwesomeKitIconProvider {

  public function __construct(
    private readonly ClientInterface $httpClient,
    private readonly ConfigFactoryInterface $configFactory,
  ) {}

  public function getConfiguredKitUrl(): ?string {
    $kitUrl = (string) $this->configFactory->get('button_link.settings')->get('kit_url');
    $kitUrl = trim($kitUrl);
    return $kitUrl !== '' ? $kitUrl : NULL;
  }

  /**
   * @return string[]
   */
  public function getIconsFromConfiguredKit(): array {
    $kitUrl = $this->getConfiguredKitUrl();
    if ($kitUrl === NULL) {
      return [];
    }
    return $this->getIconsForKitUrl($kitUrl);
  }

  /**
   * @return string[]
   */
  public function getIconsForKitUrl(string $kitUrl): array {
    // Primary source: local installed kit package has exact per-style icon lists.
    $localIcons = $this->getIconsFromInstalledKitPackage($kitUrl);
    if (!empty($localIcons)) {
      // Also check live kit to detect newly-added icons (for sync support).
      try {
        $liveIcons = $this->fetchIcons($kitUrl);
        if (!empty($liveIcons)) {
          // Merge: keep local canonical list, add only truly new live icon tokens.
          $localTokens = [];
          foreach ($localIcons as $icon) {
            $token = $this->extractToken($icon);
            if ($token !== NULL) {
              $localTokens[$token] = TRUE;
            }
          }

          $aliasTokens = $this->getAliasTokensFromInstalledKitPackage($kitUrl);

          $newLiveIcons = [];
          foreach ($liveIcons as $icon) {
            if (!is_string($icon) || $icon === '') {
              continue;
            }

            $token = $this->extractToken($icon);
            if ($token === NULL) {
              continue;
            }

            // Skip aliases and icons already represented by local canonical set.
            if (isset($aliasTokens[$token]) || isset($localTokens[$token])) {
              continue;
            }

            $newLiveIcons[] = $this->normalizeStylefulValue($icon);
          }

          $merged = array_merge($localIcons, $newLiveIcons);
          $merged = array_values(array_unique(array_filter($merged, fn ($icon) => is_string($icon) && $icon !== '')));
          sort($merged);
          return $merged;
        }
      } catch (\Throwable $e) {
        // If live fetch fails, just use local.
      }
      sort($localIcons);
      return $localIcons;
    }

    // Fallback: try live kit alone if local package not found.
    try {
      $icons = $this->fetchIcons($kitUrl);
      if (!empty($icons)) {
        $icons = array_values(array_unique(array_filter($icons, fn ($icon) => is_string($icon) && $icon !== '')));
        sort($icons);
        return $icons;
      }
    } catch (\Throwable $e) {
      if (class_exists('\\Drupal') && \Drupal::hasContainer()) {
        \Drupal::logger('button_link')->warning(
          'Falling back to local Font Awesome kit JSON: @message',
          ['@message' => $e->getMessage()],
        );
      }
    }

    $themeName = $this->getActiveThemeName();
    if (!$themeName) {
      return [];
    }
    $jsonPath = \Drupal::root() . '/public/themes/' . $themeName . '/build/fontawesome-kit-icons.json';
    if (!file_exists($jsonPath)) {
      return [];
    }

    $data = json_decode(file_get_contents($jsonPath), TRUE);
    $icons = array_values(array_filter($data['icons'] ?? [], function ($icon) {
      if (!is_string($icon)) {
        return FALSE;
      }
      $icon = trim(strtolower($icon));
      if ($icon === '' || !str_starts_with($icon, 'fa-')) {
        return FALSE;
      }
      return !in_array($icon, ['fa-solid', 'fa-regular', 'fa-brands', 'fa-duotone', 'fa-light', 'fa-thin', 'fa-sharp', 'fa-classic'], TRUE);
    }));

    sort($icons);
    return $icons;
  }

  /**
   * Read exact styleful icon entries from the locally installed kit package.
   *
   * This is the most accurate source available in this repository because it
   * preserves the kit's per-style selection without the alias noise introduced
   * by parsing combined CSS selectors.
   *
   * @return string[]
   */
  private function getIconsFromInstalledKitPackage(string $kitUrl): array {
    $kitToken = $this->extractKitToken($kitUrl);
    if ($kitToken === NULL) {
      return [];
    }

    $themeName = $this->getActiveThemeName();
    if (!$themeName) {
      return [];
    }
    $basePath = \Drupal::root() . '/themes/' . $themeName . '/node_modules/@awesome.me/kit-' . $kitToken . '/icons/modules';
    if (!is_dir($basePath)) {
      return [];
    }

    $moduleMap = [
      'fa-classic fa-solid' => $basePath . '/classic/solid.js',
      'fa-classic fa-regular' => $basePath . '/classic/regular.js',
      'fa-classic fa-light' => $basePath . '/classic/light.js',
      'fa-classic fa-thin' => $basePath . '/classic/thin.js',
      'fa-brands' => $basePath . '/classic/brands.js',
      'fa-duotone fa-solid' => $basePath . '/duotone/solid.js',
    ];

    $values = [];
    foreach ($moduleMap as $style => $modulePath) {
      if (!file_exists($modulePath)) {
        continue;
      }

      $source = file_get_contents($modulePath);
      if ($source === FALSE || $source === '') {
        continue;
      }

      if (!preg_match_all('/iconName:\s*["\']([^"\']+)["\']/', $source, $matches) || empty($matches[1])) {
        continue;
      }

      foreach ($matches[1] as $iconName) {
        $iconName = trim((string) $iconName);
        if ($iconName === '') {
          continue;
        }
        $values[$style . ' fa-' . $iconName] = $style . ' fa-' . $iconName;
      }
    }

    return array_values($values);
  }

  /**
   * Build a set of alias tokens from the installed kit module files.
   *
   * @return array<string, true>
   */
  private function getAliasTokensFromInstalledKitPackage(string $kitUrl): array {
    $kitToken = $this->extractKitToken($kitUrl);
    if ($kitToken === NULL) {
      return [];
    }

    $themeName = $this->getActiveThemeName();
    if (!$themeName) {
      return [];
    }
    $basePath = \Drupal::root() . '/themes/' . $themeName . '/node_modules/@awesome.me/kit-' . $kitToken . '/icons/modules';
    if (!is_dir($basePath)) {
      return [];
    }

    $modulePaths = [
      $basePath . '/classic/solid.js',
      $basePath . '/classic/regular.js',
      $basePath . '/classic/light.js',
      $basePath . '/classic/thin.js',
      $basePath . '/classic/brands.js',
      $basePath . '/duotone/solid.js',
    ];

    $aliases = [];
    foreach ($modulePaths as $modulePath) {
      if (!file_exists($modulePath)) {
        continue;
      }

      $source = file_get_contents($modulePath);
      if ($source === FALSE || $source === '') {
        continue;
      }

      // Capture icon entries and parse aliases from the third item in icon array.
      if (!preg_match_all('/iconName:\s*["\']([^"\']+)["\']\s*,\s*icon:\s*\[\s*\d+\s*,\s*\d+\s*,\s*\[([^\]]*)\]/s', $source, $matches, PREG_SET_ORDER)) {
        continue;
      }

      foreach ($matches as $match) {
        $canonical = 'fa-' . strtolower(trim((string) $match[1]));
        if ($canonical === 'fa-') {
          continue;
        }

        $aliasBlock = (string) $match[2];
        if ($aliasBlock === '') {
          continue;
        }

        if (!preg_match_all('/["\']([^"\']+)["\']/', $aliasBlock, $aliasMatches)) {
          continue;
        }

        foreach ($aliasMatches[1] as $aliasName) {
          $aliasName = strtolower(trim((string) $aliasName));
          if ($aliasName === '') {
            continue;
          }
          $token = 'fa-' . $aliasName;
          if ($token !== $canonical) {
            $aliases[$token] = TRUE;
          }
        }
      }
    }

    return $aliases;
  }

  private function extractToken(string $value): ?string {
    if (preg_match_all('/\bfa-[a-z0-9-]+\b/i', strtolower($value), $m) && !empty($m[0])) {
      return end($m[0]) ?: NULL;
    }
    return NULL;
  }

  private function normalizeStylefulValue(string $value): string {
    $value = trim(strtolower($value));
    if ($value === '') {
      return $value;
    }

    if (preg_match('/\bfa-duotone\b/', $value) && !preg_match('/\bfa-solid\b/', $value)) {
      // Duotone kit icons generally need both classes in this project context.
      $value = 'fa-duotone fa-solid ' . ltrim(str_replace('fa-duotone', '', $value));
      $value = preg_replace('/\s+/', ' ', trim((string) $value)) ?? $value;
    }

    return $value;
  }

  /**
   * Fetch icons from the live kit CSS endpoint.
   *
   * @return string[]
   */
  private function fetchIcons(string $kitUrl): array {
    return $this->fetchIconsFromKitCss($kitUrl);
  }

  /**
   * Extract the kit token from a kit URL.
   *
   * E.g. "https://kit.fontawesome.com/85187b9626.js" → "85187b9626"
   */
  private function extractKitToken(string $kitUrl): ?string {
    if (preg_match('#/([a-f0-9]+)\.(js|css)$#i', $kitUrl, $m)) {
      return $m[1];
    }
    return NULL;
  }

  /**
   * Get the active custom theme name.
   */
  private function getActiveThemeName(): ?string {
    try {
      $activeTheme = \Drupal::service('theme.manager')->getActiveTheme();
      if ($activeTheme && $activeTheme->isBaseTheme() === FALSE) {
        return $activeTheme->getName();
      }
    } catch (\Throwable $e) {
      // Silently fail and try default theme.
    }

    try {
      $defaultTheme = \Drupal::config('system.theme')->get('default');
      if ($defaultTheme) {
        return $defaultTheme;
      }
    } catch (\Throwable $e) {
      // Silently fail.
    }

    return NULL;
  }

  // ---------- CSS-based fallback ----------

  /**
   * @return string[]
   */
  private function fetchIconsFromKitCss(string $kitUrl): array {
    $cssBootstrapUrl = $this->normalizeToCssBootstrapUrl($kitUrl);
    $bootstrapCss = $this->httpGet($cssBootstrapUrl);

    $importUrls = $this->extractImportUrls($bootstrapCss);
    if (!empty($importUrls)) {
      $stylefulValues = [];
      foreach ($importUrls as $importUrl) {
        $styleClass = $this->inferStyleClassFromImportUrl($importUrl);
        if ($styleClass === NULL) {
          continue;
        }

        $importCss = $this->httpGet($importUrl);
        $tokens = $this->extractIconTokensFromCss($importCss);
        foreach ($tokens as $token) {
          $value = $styleClass . ' ' . $token;
          $stylefulValues[$value] = $value;
        }
      }

      if (!empty($stylefulValues)) {
        return array_values($stylefulValues);
      }
    }

    $importUrl = $this->extractImportUrl($bootstrapCss);
    $css = $importUrl ? $this->httpGet($importUrl) : $bootstrapCss;

    return $this->extractStyleAwareIconValues($css);
  }

  /**
   * @return string[]
   */
  private function extractImportUrls(string $css): array {
    $urls = [];
    if (preg_match_all('/@import\s+url\(([^)]+)\)\s*;?/i', $css, $matches) && !empty($matches[1])) {
      foreach ($matches[1] as $rawUrl) {
        $url = trim((string) $rawUrl, " \t\n\r\0\x0B\"'");
        if ($url !== '' && filter_var($url, FILTER_VALIDATE_URL)) {
          $urls[$url] = $url;
        }
      }
    }
    return array_values($urls);
  }

  private function inferStyleClassFromImportUrl(string $url): ?string {
    $u = strtolower($url);
    if (str_contains($u, 'brands')) {
      return 'fa-brands';
    }
    if (str_contains($u, 'duotone')) {
      return 'fa-duotone fa-solid';
    }
    if (str_contains($u, 'regular')) {
      return 'fa-classic fa-regular';
    }
    if (str_contains($u, 'solid')) {
      return 'fa-classic fa-solid';
    }
    return NULL;
  }

  /**
   * @return string[]
   */
  private function extractIconTokensFromCss(string $css): array {
    $tokens = [];
    $styleNames = ['solid', 'regular', 'brands', 'duotone', 'light', 'thin', 'sharp', 'classic'];

    if (preg_match_all('/\.fa-([a-z0-9-]+)\s*\{[^}]*--fa\s*:/i', $css, $m1) && !empty($m1[1])) {
      foreach ($m1[1] as $name) {
        $name = strtolower((string) $name);
        if (in_array($name, $styleNames, TRUE)) {
          continue;
        }
        $token = 'fa-' . $name;
        $tokens[$token] = $token;
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\s*:(?:before|after)\s*\{[^}]*content\s*:/i', $css, $m2) && !empty($m2[1])) {
      foreach ($m2[1] as $name) {
        $name = strtolower((string) $name);
        if (in_array($name, $styleNames, TRUE)) {
          continue;
        }
        $token = 'fa-' . $name;
        $tokens[$token] = $token;
      }
    }

    return array_values($tokens);
  }

  /**
   * @return string[]
   */
  private function extractStyleAwareIconValues(string $css): array {
    $raw = $this->extractIconClassNames($css);
    if (!$raw) {
      return [];
    }

    $brandIcons = $this->extractBrandIconTokens($css);

    $values = [];
    foreach ($raw as $value) {
      if (!is_string($value)) {
        continue;
      }
      $value = trim($value);
      if ($value === '' || !str_starts_with($value, 'fa-')) {
        continue;
      }

      if (str_contains($value, ' ')) {
        $values[$value] = $value;
        continue;
      }

      if (isset($brandIcons[$value])) {
        $styleful = 'fa-brands ' . $value;
        $values[$styleful] = $styleful;
        continue;
      }

      $values[$value] = $value;
    }

    return array_values($values);
  }

  /**
   * @return array<string, true>
   */
  private function extractBrandIconTokens(string $css): array {
    $start = stripos($css, '--fa-family-brands');
    if ($start === FALSE) {
      return [];
    }

    $tail = substr($css, $start);
    if ($tail === FALSE || $tail === '') {
      return [];
    }

    $tokens = [];
    if (preg_match_all('/\.fa-([a-z0-9-]+)\s*\{[^}]*--fa\s*:/i', $tail, $m)) {
      foreach ($m[1] as $name) {
        $name = strtolower((string) $name);
        if (in_array($name, ['solid', 'regular', 'brands', 'duotone', 'classic', 'sharp'], TRUE)) {
          continue;
        }
        $token = 'fa-' . $name;
        $tokens[$token] = TRUE;
      }
    }

    return $tokens;
  }

  private function normalizeToCssBootstrapUrl(string $kitUrl): string {
    if (str_ends_with($kitUrl, '.js')) {
      return substr($kitUrl, 0, -3) . '.css';
    }
    return $kitUrl;
  }

  private function extractImportUrl(string $css): ?string {
    if (preg_match('/@import\s+url\(([^)]+)\)\s*;?/i', $css, $m)) {
      $url = trim($m[1], " \t\n\r\0\x0B\"'");
      return filter_var($url, FILTER_VALIDATE_URL) ? $url : NULL;
    }
    return NULL;
  }

  private function httpGet(string $url): string {
    $res = $this->httpClient->request('GET', $url, [
      'timeout' => 10,
      'headers' => [
        'Accept' => 'text/css,*/*;q=0.1',
      ],
    ]);

    if ($res->getStatusCode() < 200 || $res->getStatusCode() >= 300) {
      throw new \RuntimeException('HTTP ' . $res->getStatusCode());
    }

    return (string) $res->getBody();
  }

  /**
   * @return string[]
   */
  private function extractIconClassNames(string $css): array {
    $icons = [];
    $stylefulIconNames = [];

    $knownStyles = [
      'solid', 'regular', 'brands', 'duotone', 'light', 'thin',
      'sharp', 'sharp-solid', 'sharp-regular', 'sharp-light',
      'sharp-thin', 'sharp-duotone',
    ];

    $addPair = static function (string $a, string $b) use (&$icons, &$stylefulIconNames, $knownStyles): void {
      $a = strtolower($a);
      $b = strtolower($b);

      $aIsStyle = in_array($a, $knownStyles, TRUE);
      $bIsStyle = in_array($b, $knownStyles, TRUE);

      if ($aIsStyle && !$bIsStyle) {
        $value = 'fa-' . $a . ' fa-' . $b;
        $icons[$value] = $value;
        $stylefulIconNames['fa-' . $b] = TRUE;
        return;
      }
      if ($bIsStyle && !$aIsStyle) {
        $value = 'fa-' . $b . ' fa-' . $a;
        $icons[$value] = $value;
        $stylefulIconNames['fa-' . $a] = TRUE;
        return;
      }

      $icons['fa-' . $a] = 'fa-' . $a;
      $icons['fa-' . $b] = 'fa-' . $b;
    };

    $addTriple = static function (string $a, string $b, string $c) use (&$icons, &$stylefulIconNames, $knownStyles): void {
      $parts = [strtolower($a), strtolower($b), strtolower($c)];
      $styles = [];
      $token = NULL;

      foreach ($parts as $part) {
        if (in_array($part, $knownStyles, TRUE)) {
          $styles[] = 'fa-' . $part;
        }
        elseif ($token === NULL) {
          $token = 'fa-' . $part;
        }
      }

      if ($token !== NULL && !empty($styles)) {
        $styles = array_values(array_unique($styles));
        $value = implode(' ', $styles) . ' ' . $token;
        $icons[$value] = $value;
        $stylefulIconNames[$token] = TRUE;
        return;
      }

      foreach ($parts as $part) {
        $icons['fa-' . $part] = 'fa-' . $part;
      }
    };

    if (preg_match_all('/\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\s*\{[^}]*--fa\s*:/i', $css, $m0)) {
      $count = count($m0[1]);
      for ($i = 0; $i < $count; $i++) {
        $addTriple($m0[1][$i], $m0[2][$i], $m0[3][$i]);
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\s*:(?:before|after)\s*\{[^}]*content\s*:/i', $css, $m0b)) {
      $count = count($m0b[1]);
      for ($i = 0; $i < $count; $i++) {
        $addTriple($m0b[1][$i], $m0b[2][$i], $m0b[3][$i]);
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\s*\{[^}]*--fa\s*:/i', $css, $m)) {
      $count = count($m[1]);
      for ($i = 0; $i < $count; $i++) {
        $addPair($m[1][$i], $m[2][$i]);
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\.fa-([a-z0-9-]+)\s*:(?:before|after)\s*\{[^}]*content\s*:/i', $css, $m2)) {
      $count = count($m2[1]);
      for ($i = 0; $i < $count; $i++) {
        $addPair($m2[1][$i], $m2[2][$i]);
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\s*\{[^}]*--fa\s*:/i', $css, $m3)) {
      foreach ($m3[1] as $name) {
        $icon = 'fa-' . strtolower($name);
        if (!isset($stylefulIconNames[$icon])) {
          $icons[$icon] = $icon;
        }
      }
    }

    if (preg_match_all('/\.fa-([a-z0-9-]+)\s*:(?:before|after)\s*\{[^}]*content\s*:/i', $css, $m4)) {
      foreach ($m4[1] as $name) {
        $icon = 'fa-' . strtolower($name);
        if (!isset($stylefulIconNames[$icon])) {
          $icons[$icon] = $icon;
        }
      }
    }

    return array_values($icons);
  }

}
