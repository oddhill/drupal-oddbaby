(function (Drupal, once, drupalSettings) {
  'use strict';

  function isDebugEnabled() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.has('button_link_fa_debug')) return true;
      return window.localStorage && window.localStorage.getItem('button_link_fa_debug') === '1';
    } catch (e) {
      return false;
    }
  }

  function probeIcon(className) {
    try {
      if (!document.body) return null;
      const el = document.createElement('i');
      el.className = className;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      document.body.appendChild(el);

      const before = window.getComputedStyle(el, '::before');
      const content = before ? before.getPropertyValue('content') : null;
      const fontFamily = window.getComputedStyle(el).getPropertyValue('font-family');
      const fontWeight = window.getComputedStyle(el).getPropertyValue('font-weight');

      el.remove();
      return { className, content, fontFamily, fontWeight };
    } catch (e) {
      return { className, error: String(e && e.message ? e.message : e) };
    }
  }

  function getKitUrl() {
    const root = drupalSettings && drupalSettings.buttonLink ? drupalSettings.buttonLink : {};
    const url = typeof root.fontAwesomeKitUrl === 'string' ? root.fontAwesomeKitUrl.trim() : '';
    return url || null;
  }

  function getFallbackCssUrl() {
    const root = drupalSettings && drupalSettings.buttonLink ? drupalSettings.buttonLink : {};
    const url = typeof root.fontAwesomeCssUrl === 'string' ? root.fontAwesomeCssUrl.trim() : '';
    return url || null;
  }

  function injectCss(url) {
    if (!url) return;
    const existing = document.querySelector(
      `link[data-button-link-fa-css="1"][href="${CSS.escape(url)}"]`,
    );
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-button-link-fa-css', '1');
    document.head.appendChild(link);
  }

  function injectKit(url) {
    if (!url) return;

    // The kit JS handles dynamic font loading — the CSS alone only has stub
    // @font-face data with no real glyphs.
    const jsUrl = url.replace(/\.css$/, '.js');

    // Already loaded (e.g. server-side injection via html_head)?
    const existing = document.querySelector(
      'script[data-button-link-fa-kit="1"]',
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = jsUrl;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-button-link-fa-kit', '1');
    document.head.appendChild(script);
  }

  Drupal.behaviors.buttonLinkFontAwesomeKitLoader = {
    attach(context) {
      // Run once per page.
      // Note: on AJAX-rendered forms, `context` is a fragment and may not
      // contain the <html> element; use `document` to ensure we still inject.
      once('button-link-fa-kit', 'html', document).forEach(() => {
        const kitUrl = getKitUrl();
        if (kitUrl) {
          injectKit(kitUrl);
        } else {
          // No kit configured: fall back to same-origin self-hosted CSS.
          injectCss(getFallbackCssUrl());
        }

        if (isDebugEnabled()) {
          // Give the browser a moment to apply injected kit CSS.
          window.setTimeout(() => {
            const svgCount = document.querySelectorAll('svg.svg-inline--fa, svg[data-fa-i2svg]').length;
            const iCount = document.querySelectorAll('i.fa, i.fas, i.far, i.fab, i.fa-solid, i.fa-regular, i.fa-brands, i.fa-duotone').length;

            let existingIcons = [];
            try {
              const els = Array.from(
                document.querySelectorAll('i.fa, i.fas, i.far, i.fab, i.fa-solid, i.fa-regular, i.fa-brands, i.fa-duotone')
              ).slice(0, 10);
              existingIcons = els.map((el) => {
                const before = window.getComputedStyle(el, '::before');
                const cs = window.getComputedStyle(el);
                return {
                  className: el.className,
                  beforeContent: before ? before.getPropertyValue('content') : null,
                  fontFamily: cs.getPropertyValue('font-family'),
                  fontWeight: cs.getPropertyValue('font-weight'),
                };
              });
            } catch (e) {
              existingIcons = [{ error: String(e && e.message ? e.message : e) }];
            }

            let pickerSample = null;
            try {
              const pickerIcon = document.querySelector('.button-link-icon-picker i');
              if (pickerIcon) {
                const before = window.getComputedStyle(pickerIcon, '::before');
                pickerSample = {
                  className: pickerIcon.className,
                  beforeContent: before ? before.getPropertyValue('content') : null,
                  fontFamily: window.getComputedStyle(pickerIcon).getPropertyValue('font-family'),
                  fontWeight: window.getComputedStyle(pickerIcon).getPropertyValue('font-weight'),
                };
              }
            } catch (e) {
              pickerSample = { error: String(e && e.message ? e.message : e) };
            }

            const fontChecks = {};
            try {
              if (document.fonts && typeof document.fonts.check === 'function') {
                fontChecks.proClassic900 = document.fonts.check('900 16px "Font Awesome 7 Pro"', '\uf34e');
                fontChecks.proClassic400 = document.fonts.check('400 16px "Font Awesome 7 Pro"', '\uf34e');
                fontChecks.brands400 = document.fonts.check('400 16px "Font Awesome 7 Brands"', '\ue61b');
                fontChecks.duotone900 = document.fonts.check('900 16px "Font Awesome 7 Duotone"', '\uf34e');

                // Also check the kit has the glyph for fa-acorn (\uf6ae) in the
                // style fonts we try to use.
                fontChecks.proClassic900_acorn = document.fonts.check('900 16px "Font Awesome 7 Pro"', '\uf6ae');
                fontChecks.proClassic400_acorn = document.fonts.check('400 16px "Font Awesome 7 Pro"', '\uf6ae');
                fontChecks.duotone900_acorn = document.fonts.check('900 16px "Font Awesome 7 Duotone"', '\uf6ae');

                fontChecks.status = document.fonts.status;
              } else {
                fontChecks.unsupported = true;
              }
            } catch (e) {
              fontChecks.error = String(e && e.message ? e.message : e);
            }

            // eslint-disable-next-line no-console
            console.info('[button_link] Font Awesome debug', {
              kitUrl: kitUrl || null,
              fallbackCssUrl: getFallbackCssUrl(),
              dom: {
                svgCount,
                iCount,
                pickerSample,
                existingIcons,
              },
              fontChecks,
              probes: [
                probeIcon('fa-brands fa-x-twitter'),
                probeIcon('fa-solid fa-alarm-clock'),
                probeIcon('fa-regular fa-alarm-clock'),
                probeIcon('fa-duotone fa-alarm-clock'),
                probeIcon('fa-solid fa-acorn'),
                probeIcon('fa-regular fa-acorn'),
                probeIcon('fa-duotone fa-acorn'),
              ],
            });
          }, 1200);
        }
      });
    },
  };
})(Drupal, once, drupalSettings);
