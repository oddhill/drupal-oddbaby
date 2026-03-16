(function (Drupal, once, drupalSettings) {
  'use strict';

  const settings = drupalSettings?.buttonLink || {};
  const iconsUrl = settings.fontAwesomeIconsUrl || null;
  const kitUrl = settings.fontAwesomeKitUrl || null;
  const defaultClassicStyle = settings.defaultClassicStyle || 'solid';

  let iconsPromise = null;
  let iconMetaPromise = null;
  const variantSupportCache = new Map();

  function decodeCssContent(content) {
    const value = (content || '').trim();
    if (!value || value === 'none' || value === 'normal') {
      return '';
    }

    const beforeSlash = value.split('/')[0].trim();
    if (!beforeSlash || beforeSlash === 'none' || beforeSlash === 'normal') {
      return '';
    }

    const unquoted = beforeSlash.replace(/^['"]|['"]$/g, '');
    if (!unquoted) {
      return '';
    }

    return unquoted.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch (error) {
        return '';
      }
    });
  }

  function normalizeFontFamily(fontFamily) {
    return (fontFamily || '')
      .split(',')
      .map(part => part.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
      .map(part => `"${part}"`)
      .join(', ');
  }

  function waitForFontAwesomeFonts() {
    if (!kitUrl || !document.fonts || typeof document.fonts.ready?.then !== 'function') {
      return Promise.resolve();
    }

    return Promise.race([
      document.fonts.ready.catch(() => undefined),
      new Promise(resolve => window.setTimeout(resolve, 1200)),
    ]);
  }

  function isVariantRenderable(className) {
    const key = (className || '').trim();
    if (!key) {
      return false;
    }

    if (variantSupportCache.has(key)) {
      return variantSupportCache.get(key);
    }

    let isRenderable = false;

    try {
      const probe = document.createElement('i');
      probe.className = key;
      probe.style.position = 'absolute';
      probe.style.left = '-9999px';
      probe.style.top = '-9999px';
      probe.style.pointerEvents = 'none';
      document.body.appendChild(probe);

      const before = window.getComputedStyle(probe, '::before');
      const computed = window.getComputedStyle(probe);
      const content = decodeCssContent(before ? before.getPropertyValue('content') : '');
      const fontFamily = normalizeFontFamily(computed.getPropertyValue('font-family'));
      const fontWeight = computed.getPropertyValue('font-weight').trim() || '400';

      // Presence of glyph content is the strongest signal for FA CSS-backed icons.
      // document.fonts.check() can return false negatives for valid kit classes.
      isRenderable = !!content;

      probe.remove();
    } catch (error) {
      isRenderable = false;
    }

    variantSupportCache.set(key, isRenderable);
    return isRenderable;
  }

  function getPrefixesForVariant(className) {
    const key = (className || '').trim();
    if (!key) {
      return [];
    }

    if (key.includes('fa-brands')) {
      return ['fab'];
    }
    if (key.includes('fa-duotone')) {
      return ['fad'];
    }
    if (key.includes('fa-light')) {
      return ['fal'];
    }
    if (key.includes('fa-thin')) {
      return ['fat'];
    }
    if (key.includes('fa-regular')) {
      return ['far'];
    }
    if (key.includes('fa-solid')) {
      return ['fas'];
    }

    return ['fad', 'fat', 'fal', 'far', 'fas', 'fab'];
  }

  function isVariantInKitLibrary(className) {
    const token = extractIconToken(className);
    if (!token || !token.startsWith('fa-')) {
      return false;
    }

    const iconName = token.slice(3);
    if (!iconName) {
      return false;
    }

    const findDef = window.FontAwesome && typeof window.FontAwesome.findIconDefinition === 'function'
      ? window.FontAwesome.findIconDefinition.bind(window.FontAwesome)
      : null;

    if (!findDef) {
      return false;
    }

    const prefixes = getPrefixesForVariant(className);
    for (const prefix of prefixes) {
      try {
        const def = findDef({ prefix, iconName });
        if (def && def.icon) {
          return true;
        }
      } catch (error) {
        // Ignore and continue trying other prefixes.
      }
    }

    return false;
  }

  function resolveKitVariant(token, preferred = '') {
    const iconToken = (token || '').trim();
    const preferredValue = (preferred || '').trim();
    if (!iconToken) {
      return preferredValue;
    }

    if (preferredValue && isVariantRenderable(preferredValue)) {
      return preferredValue;
    }

    const probeOrder = [
      `fa-duotone fa-solid ${iconToken}`,
      `fa-duotone ${iconToken}`,
      `fa-classic fa-light ${iconToken}`,
      `fa-light ${iconToken}`,
      `fa-classic fa-thin ${iconToken}`,
      `fa-thin ${iconToken}`,
      `fa-classic fa-regular ${iconToken}`,
      `fa-regular ${iconToken}`,
      `fa-classic fa-solid ${iconToken}`,
      `fa-solid ${iconToken}`,
      `fa-brands ${iconToken}`,
    ];

    for (const candidate of probeOrder) {
      if (isVariantInKitLibrary(candidate)) {
        return candidate;
      }
    }

    for (const candidate of probeOrder) {
      if (isVariantRenderable(candidate)) {
        return candidate;
      }
    }

    // Some FA7 kit-only icons require both duotone and solid classes.
    const fallback = preferredValue || `fa-duotone fa-solid ${iconToken}`;
    return fallback;
  }

  function buildPickerVariants(icons, meta) {
    const variants = [];
    const seen = new Set();
    const classicStyles = ['fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone'];

    function addVariant(value) {
      const normalized = (value || '').trim();
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      variants.push(normalized);
    }

    (icons || []).forEach((icon) => {
      if (typeof icon !== 'string') {
        return;
      }

      const value = icon.trim();
      if (!value) {
        return;
      }

      const token = extractIconToken(value);
      if (!token) {
        return;
      }

      if (kitUrl) {
        // Keep backend-provided styleful values exactly as delivered.
        if (value.includes(' ')) {
          addVariant(value);
        }
        else {
          const resolved = resolveKitVariant(token);
          addVariant(resolved);
        }
        return;
      }

      if (value.includes(' ')) {
        addVariant(value);
        return;
      }

      if (meta?.brandTokens?.has(token)) {
        addVariant(`fa-brands ${token}`);
        return;
      }

      classicStyles.forEach((style) => {
        addVariant(`${style} ${token}`);
      });
    });

    // In kit mode, variants are normalized to a renderable style per icon.
    if (kitUrl) {
      return variants;
    }

    const supported = variants.filter(isVariantRenderable);
    return supported;
  }

  // Extract the last "fa-..." token from a value.
  function extractIconToken(value) {
    const v = (value || '').trim();
    if (!v) return '';
    const m = v.match(/\bfa-[a-z0-9-]+\b/gi);
    return m && m.length ? m[m.length - 1].toLowerCase() : '';
  }

  // Build metadata for icons: brand tokens, styleful icons.
  function buildIconMeta(icons) {
    const iconSet = new Set();
    const brandTokens = new Set();
    let hasStylefulClassic = false;
    const styleTokens = new Set(['fa-solid', 'fa-regular', 'fa-brands', 'fa-duotone', 'fa-light', 'fa-thin', 'fa-sharp', 'fa-classic']);

    (icons || []).forEach((i) => {
      if (typeof i !== 'string') return;
      const value = i.trim();
      if (!value) return;

      const token = extractIconToken(value);
      if (!token || styleTokens.has(token)) {
        return;
      }

      iconSet.add(value);

      if (/^fa-(solid|regular|duotone)\s+fa-/.test(value)) {
        hasStylefulClassic = true;
      }

      if (value.startsWith('fa-brands ')) {
        if (token) brandTokens.add(token);
      }
    });

    const meta = { iconSet, brandTokens, hasStylefulClassic };
    return meta;
  }

  // Normalize a stored icon class, respecting kit/brand/style.
  function normalizeIconClasses(value, meta) {
    const v = (value || '').trim();
    if (!v) return '';

    const token = extractIconToken(v);
    const isBrand = token && meta?.brandTokens?.has(token);

    let normalized = v;

    if (/\bfa-(solid|regular|brands|duotone|classic|light|thin|sharp)\b/.test(v)) {
      if (kitUrl && isBrand && !v.includes('fa-brands')) {
        normalized = `fa-brands ${token}`;
        return normalized;
      }
      return v;
    }

    if (v.startsWith('fa-')) {
      if (kitUrl && isBrand) {
        normalized = `fa-brands ${token}`;
        return normalized;
      }
      if (kitUrl && token) {
        normalized = resolveKitVariant(token);
        return normalized;
      }
      const style = kitUrl ? `fa-${defaultClassicStyle}` : 'fa-solid';
      normalized = `${style} ${v}`;
      return normalized;
    }

    return v;
  }

  function extractIconsFromKitCSS() {
    const icons = new Set();
    const regex = /\.(fa-(?:solid|regular|brands|duotone|light|thin|sharp))\.(fa-[a-z0-9-]+)/gi;
    const helperTokens = new Set([
      'fa-li',
      'fa-stack-1x',
      'fa-stack-2x',
      'fa-swap-opacity',
      'fa-fw',
      'fa-inverse',
      'fa-pull-left',
      'fa-pull-right',
      'fa-ul',
      'fa-layers',
    ]);

    for (const sheet of document.styleSheets) {
      try {
        if (!sheet.cssRules) {
          continue;
        }

        for (const rule of sheet.cssRules) {
          if (!rule.selectorText) {
            continue;
          }

          let match = null;
          while ((match = regex.exec(rule.selectorText))) {
            if (!helperTokens.has(match[2])) {
              icons.add(`${match[1]} ${match[2]}`);
            }
          }
          regex.lastIndex = 0;
        }
      }
      catch (error) {
        // Ignore stylesheet parsing errors
      }
    }

    return Array.from(icons).sort();
  }

  // Load icons from backend kit endpoint first; CSS extraction is last-resort fallback.
  function loadIcons() {
    if (drupalSettings.buttonLink.fontAwesomeKitUrl) {
      if (!iconsPromise) {
        iconsPromise = waitForFontAwesomeFonts().then(() => {
          let kitIconsUrl = drupalSettings.buttonLink.fontAwesomeKitIconsUrl;
          if (!kitIconsUrl && drupalSettings.buttonLink.themeName) {
            kitIconsUrl = `/themes/${drupalSettings.buttonLink.themeName}/build/fontawesome-kit-icons.json`;
          }
          if (!kitIconsUrl) {
            throw new Error('Font Awesome kit icons URL not available: theme name is missing from drupalSettings');
          }
          return fetch(kitIconsUrl, {
            credentials: 'same-origin',
            cache: 'no-store',
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to load kit icons: ${res.status}`);
              }
              return res.json();
            })
            .then(json => {
              const icons = json && Array.isArray(json.icons) ? json.icons : [];
              const normalized = [];
              const seen = new Set();

              icons.forEach((icon) => {
                if (typeof icon !== 'string') {
                  return;
                }
                const value = icon.trim();
                if (!value) {
                  return;
                }

                const token = extractIconToken(value);
                if (!token) {
                  return;
                }

                const resolved = value.includes(' ')
                  ? value
                  : resolveKitVariant(token);

                if (!resolved || seen.has(resolved)) {
                  return;
                }
                seen.add(resolved);
                normalized.push(resolved);
              });

              if (normalized.length > 0) {
                return normalized;
              }

              const extractedIcons = extractIconsFromKitCSS();
              return extractedIcons;
            });
        }).catch((error) => {
          return waitForFontAwesomeFonts().then(() => {
            const extractedIcons = extractIconsFromKitCSS();
            return extractedIcons;
          });
        });
      }
      return iconsPromise;
    }

    if (!iconsUrl) {
      return Promise.reject(new Error('Missing drupalSettings.buttonLink.fontAwesomeIconsUrl'));
    }

    if (!iconsPromise) {
      iconsPromise = fetch(iconsUrl, { credentials: 'same-origin' })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load icons: ${res.status}`);
          }
          return res.json();
        })
        .then(json => {
          const icons = json && Array.isArray(json.icons) ? json.icons : [];
          const filteredIcons = icons.filter(i => typeof i === 'string' && i.startsWith('fa-'));
          return filteredIcons;
        });
    }

    return iconsPromise;
  }

  // Ensure icon metadata is available.
  function ensureIconMeta() {
    if (!iconMetaPromise) {
      iconMetaPromise = loadIcons().then(buildIconMeta);
    }
    return iconMetaPromise;
  }

  // Render preview next to the input/select.
  function ensurePreview(targetEl) {
    let preview = targetEl.parentElement.querySelector('.button-link-icon-picker__preview');
    if (!preview) {
      preview = document.createElement('span');
      preview.className = 'button-link-icon-picker__preview';
      targetEl.insertAdjacentElement('afterend', preview);
    }

    const value = (targetEl.value || '').trim();
    if (!value) {
      preview.innerHTML = '';
      return;
    }

    ensureIconMeta().then((meta) => {
      const iconClass = normalizeIconClasses(value, meta);
      preview.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span class="visually-hidden">Selected icon</span>`;
    }).catch(() => {
      const iconClass = normalizeIconClasses(value, null);
      preview.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span class="visually-hidden">Selected icon</span>`;
    });
  }

  // Set input/select value and update preview.
  function setValue(targetEl, value) {
    if (targetEl.tagName === 'SELECT') {
      let exists = Array.from(targetEl.options).some(o => o.value === value);
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        targetEl.appendChild(opt);
      }
      targetEl.value = value;
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      targetEl.value = value;
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    ensurePreview(targetEl);
  }

  // Build the icon picker UI for a target input/select.
  function buildPicker(targetEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'button-link-icon-picker';

    const toolbar = document.createElement('div');
    toolbar.className = 'button-link-icon-picker__toolbar';

    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'button-link-icon-picker__search';
    search.placeholder = 'Search icons';

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = 'Browse';

    toolbar.append(search, toggle, clear);

    const grid = document.createElement('div');
    grid.className = 'button-link-icon-picker__grid';
    grid.hidden = true;

    const status = document.createElement('div');
    status.className = 'button-link-icon-picker__status';

    wrapper.append(toolbar, grid, status);
    targetEl.insertAdjacentElement('afterend', wrapper);

    function renderGrid(icons, query) {
      const q = (query || '').toLowerCase().trim();
      const meta = buildIconMeta(icons || []);
      const variants = buildPickerVariants(icons, meta);

      const duplicateVariants = variants.filter((item, index) => variants.indexOf(item) !== index);

      // Filter and limit.
      const filtered = q ? variants.filter(i => i.toLowerCase().includes(q)) : variants;
      const limit = q ? 500 : 200;
      const slice = filtered.slice(0, limit);

      const sampleRender = slice.map(icon => ({
        source: icon,
        normalized: normalizeIconClasses(icon, null),
        token: extractIconToken(icon),
      }));

      grid.innerHTML = '';
      slice.forEach(icon => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'button-link-icon-picker__item';
        btn.setAttribute('title', icon);
        const normalizedIcon = normalizeIconClasses(icon, null);
        btn.innerHTML = `<i class="${normalizedIcon}"></i>`;
        btn.addEventListener('click', () => {
          setValue(targetEl, icon);
        });
        grid.appendChild(btn);
      });

      status.textContent = `Matched ${filtered.length} icon(s). Showing ${slice.length}.`;
    }

    function ensureLoaded() {
      return waitForFontAwesomeFonts().then(() => loadIcons()).then((icons) => {
        iconMetaPromise = Promise.resolve(buildIconMeta(icons));
        return icons;
      }).catch((error) => {
        status.textContent = 'Could not load icon list.';
        return [];
      });
    }

    toggle.addEventListener('click', () => {
      grid.hidden = !grid.hidden;

      if (!grid.hidden) ensureLoaded().then(icons => renderGrid(icons, search.value));
    });

    clear.addEventListener('click', () => {
      setValue(targetEl, '');
    });

    search.addEventListener('input', () => {
      if (!grid.hidden) ensureLoaded().then(icons => renderGrid(icons, search.value));
    });

    targetEl.addEventListener('input', () => {
      ensurePreview(targetEl);
    });
    targetEl.addEventListener('change', () => {
      ensurePreview(targetEl);
    });

    if (targetEl.tagName === 'SELECT') {
      targetEl.classList.add('button-link-icon-picker__hidden-select');
    }

    ensurePreview(targetEl);
  }

  Drupal.behaviors.buttonLinkIconPicker = {
    attach(context) {
      const targets = once('button-link-icon-picker', 'input.button-link-icon-input, select.button-link-icon-input', context);
      targets.forEach(buildPicker);
    },
  };
})(Drupal, once, drupalSettings);