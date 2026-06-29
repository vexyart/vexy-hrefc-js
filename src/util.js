//! this_file: src/util.js
// Small shared helpers. No dependencies, no surprises.

/** Escape a string for safe insertion as HTML text. */
export function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]),
  );
}

/** Resolve a possibly-relative URL against a base. Returns null when it can't. */
export function absoluteUrl(url, base) {
  if (!url) return null;
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

/** Origin of a URL, or null. Works with or without a `location` global. */
export function originOf(url) {
  try {
    const base = typeof location !== 'undefined' ? location.href : undefined;
    return new URL(url, base).origin;
  } catch {
    return null;
  }
}

/** True when a URL resolves to the same origin as the current page. */
export function isSameOrigin(url) {
  if (typeof location === 'undefined') return false;
  const o = originOf(url);
  return o != null && o === location.origin;
}

/** Run `makePromise(signal)` with an abort timeout. Rejects if it overruns. */
export function withTimeout(makePromise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.resolve(makePromise(controller.signal)).finally(() => clearTimeout(timer));
}
