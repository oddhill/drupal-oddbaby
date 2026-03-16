<?php

declare(strict_types=1);

namespace Drupal\button_link\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Drupal\button_link\FontAwesomeKitIconProvider;

final class FontAwesomeKitIconsController extends ControllerBase {

  public function __construct(private readonly FontAwesomeKitIconProvider $provider) {}

  public static function create(ContainerInterface $container): self {
    return new self(
      $container->get('button_link.fa_kit_icon_provider'),
    );
  }

  public function icons(): Response {
    while (ob_get_level() > 0) {
      ob_end_clean();
    }

    $kitUrl = \Drupal::config('button_link.settings')->get('kit_url');
    $icons = $this->provider->getIconsForKitUrl((string) $kitUrl);

    $payload = json_encode([
      'icons' => array_values($icons),
      'source' => 'fontawesome-kit-dynamic',
    ], JSON_UNESCAPED_SLASHES);

    $response = new Response($payload . "\n", 200, [
      'Content-Type' => 'application/json',
      'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
    $response->headers->remove('Content-Length');

    return $response;
  }

}
