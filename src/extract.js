//! this_file: src/extract.js
import { absoluteUrl } from './util.js';

/** First non-empty `content`/`value` among a list of meta selectors. */
function meta(doc, selectors) {
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    const c = el && (el.getAttribute('content') || el.getAttribute('value'));
    if (c && c.trim()) return c.trim();
  }
  return '';
}

/** Trim a trailing "  Site Name" suffix after the first known separator. */
function stripSuffix(title, separators) {
  for (const sep of separators) {
    const i = title.indexOf(sep);
    if (i > 0) return title.slice(0, i).trim();
  }
  return title;
}

/** Collapse the body to a short text snippet, ignoring scripts and styles. */
function bodyText(doc, max) {
  const body = doc.body;
  if (!body) return '';
  const clone = body.cloneNode(true);
  clone.querySelectorAll('script, style, noscript, template, svg').forEach((n) => n.remove());
  const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max).trim() + '…' : text;
}

/** Best favicon: largest declared icon, else /favicon.ico. */
function favicon(doc, finalUrl) {
  const links = [...doc.querySelectorAll('link')].filter((l) =>
    ((l.getAttribute('rel') || '').toLowerCase()).includes('icon'),
  );
  let best = null;
  let bestSize = -1;
  for (const l of links) {
    const href = l.getAttribute('href');
    if (!href) continue;
    const n = parseInt(l.getAttribute('sizes') || '', 10);
    const size = Number.isFinite(n) ? n : 0;
    if (size > bestSize) {
      bestSize = size;
      best = href;
    }
  }
  return absoluteUrl(best || '/favicon.ico', finalUrl);
}

/**
 * Extract preview data from a parsed Document.
 * @param {Document} doc
 * @param {string} finalUrl  URL to resolve relative links against
 * @param {object} content   the resolved `config.content`
 * @returns {{url:string,title:string,description:string,image:string,favicon:string}}
 */
export function extractMeta(doc, finalUrl, content = {}) {
  const out = { url: finalUrl, title: '', description: '', image: '', favicon: '' };

  let title = meta(doc, ['meta[property="og:title"]', 'meta[name="twitter:title"]']);
  if (!title) {
    const t = doc.querySelector('title');
    title = t && t.textContent ? t.textContent.trim() : '';
  }
  if (title && content.stripTitleSuffix) {
    title = stripSuffix(title, content.titleSeparators || ['|']);
  }
  out.title = title;

  if (content.description !== false) {
    let desc = meta(doc, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]);
    if (!desc) desc = bodyText(doc, content.descriptionMaxLength || 350);
    out.description = desc;
  }

  if (content.thumbnail) {
    const img = meta(doc, [
      'meta[property="og:image"]',
      'meta[property="og:image:url"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]);
    out.image = img ? absoluteUrl(img, finalUrl) || '' : '';
  }

  if (content.favicon) {
    out.favicon = favicon(doc, finalUrl) || '';
  }

  return out;
}

/** Parse HTML text and extract. Browser-only (uses DOMParser). */
export function extract(html, finalUrl, content) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return extractMeta(doc, finalUrl, content);
}
