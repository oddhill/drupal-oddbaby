/**
 * Accordion component behavior
 * 
 * Optional single-open mode: Add the 'accordion--single-open' class to enable this behavior.
 */

interface DrupalBehavior {
  attach: (context: Document | HTMLElement, settings?: any) => void;
  detach?: (context: Document | HTMLElement, settings?: any, trigger?: string) => void;
}

interface DrupalStatic {
  behaviors: {
    [key: string]: DrupalBehavior;
  };
}

type OnceCallback = (id: string, selector: string, context?: Document | HTMLElement) => HTMLElement[];

declare const Drupal: DrupalStatic;
declare const once: OnceCallback;

(function (Drupal: DrupalStatic, once: OnceCallback) {
  'use strict';

  Drupal.behaviors.accordion = {
    attach: function (context: Document | HTMLElement) {
      once('accordion', '.accordion--single-open', context).forEach(function (accordion: HTMLElement) {
        const details = accordion.querySelectorAll<HTMLDetailsElement>('.accordion__item');

        details.forEach(function (targetDetail: HTMLDetailsElement) {
          targetDetail.addEventListener('toggle', function () {
            if (targetDetail.open) {
              details.forEach(function (detail: HTMLDetailsElement) {
                if (detail !== targetDetail && detail.open) {
                  detail.open = false;
                }
              });
            }
          });
        });
      });
    }
  };
})(Drupal, once);
