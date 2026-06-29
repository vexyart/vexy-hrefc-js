//! this_file: src/thumbnail.js
// Resolve a thumbnail image URL for a target page, cheapest first.
// A provider is: (url, data, opts) => string|null  (an image URL, or null to skip).

const named = {
  /** Use the og:image / twitter:image we already extracted, if any. */
  ogimage: (url, data) => (data && data.image) || null,

  /** WordPress mShots — keyless, cached, real screenshot. */
  mshots: (url, _data, opts) =>
    'https://s0.wp.com/mshots/v1/' + encodeURIComponent(url) + '?w=' + ((opts && opts.width) || 480),

  /** Microlink screenshot — keyless free tier, returns a direct image URL. */
  microlink: (url) =>
    'https://api.microlink.io/?url=' + encodeURIComponent(url) + '&screenshot=true&embed=screenshot.url',
};

/**
 * Walk the provider chain and return the first image URL, or null.
 * @param {string} url   the target page URL
 * @param {object} data  extracted data (may carry og:image)
 * @param {object} thumbCfg  the resolved `config.thumbnail`
 */
export function resolveThumbnail(url, data, thumbCfg) {
  const providers = (thumbCfg.providers || [])
    .map((p) => (typeof p === 'function' ? p : named[p]))
    .filter(Boolean);
  for (const provider of providers) {
    const src = provider(url, data, thumbCfg);
    if (src) return src;
  }
  return null;
}

/** Built-in thumbnail providers, by name. */
export const thumbnailProviders = named;
