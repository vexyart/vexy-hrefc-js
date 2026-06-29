//! this_file: src/config.js
import { jina } from './proxies.js';

/** The default configuration. Every field is overridable. */
export const defaults = {
  // Which links get previews. Opt-in by default, so you don't accidentally
  // preview every link on the page. Add `class="hrefc"` or `data-hrefc` to links.
  selector: '[data-hrefc], a.hrefc',

  trigger: 'hover', // 'hover' | 'click' | 'manual'
  hoverDelay: 120, // ms of hover before we fetch + show
  hideDelay: 160, // ms after leaving before we hide

  content: {
    title: true,
    description: true,
    thumbnail: false,
    favicon: false,
    descriptionMaxLength: 350,
    stripTitleSuffix: false, // trim "Page | Site" → "Page"
    titleSeparators: ['|', '–', '—', '·', '»', '::'],
  },

  fetch: {
    timeout: 6500,
    sameOriginDirect: true, // try native fetch for same-origin links
    crossOriginStrategy: 'proxy', // 'proxy' (skip native) | 'native-first'
    proxies: [jina], // ordered fallback chain; names or functions
  },

  thumbnail: {
    width: 480,
    providers: ['ogimage', 'mshots', 'microlink'], // names or functions
    iframe: true, // click-protected iframe fallback
    iframeViewport: { width: 1280, height: 800 },
  },

  cache: { enabled: true, max: 200 },

  popup: {
    maxWidth: 360,
    offset: 12, // gap between link and card, px
    placement: 'auto', // 'auto' | 'top' | 'bottom'
    classPrefix: 'hrefc',
    appendTo: null, // defaults to document.body at runtime
    inheritFont: true,
    theme: 'auto', // 'auto' | 'light' | 'dark'
    injectStyles: true,
    interactive: true, // hovering the card keeps it open; clicking it navigates
    zIndex: 9999,
  },

  classes: {}, // override generated class names: { root, head, title, desc, thumb, ... }

  render: null, // (data, link) => HTMLElement | string ; total control of the card

  onShow: null, // (data, link, popupEl) => void
  onHide: null, // (link) => void
  onError: null, // (error, link) => void  (UI stays silent regardless)
};

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Deep-merge `override` onto `base`. Objects merge; arrays and scalars replace. */
export function mergeConfig(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override;
  const out = isPlainObject(base) ? { ...base } : {};
  for (const key of Object.keys(override)) {
    const b = isPlainObject(base) ? base[key] : undefined;
    const o = override[key];
    out[key] = isPlainObject(b) && isPlainObject(o) ? mergeConfig(b, o) : o;
  }
  return out;
}

/** Build a normalized config from user input, leaving `defaults` untouched. */
export function resolveConfig(user) {
  return mergeConfig(defaults, user || {});
}
