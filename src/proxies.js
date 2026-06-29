//! this_file: src/proxies.js
// Proxy adapters turn a CORS-blocked request into readable HTML.
// An adapter is: (url, signal) => Promise<string> that resolves to HTML text.
// Throw to fall through to the next adapter in the chain.

/**
 * r.jina.ai reader. Returns the target page's HTML.
 * Mirrors: curl "https://r.jina.ai/<url>" -H "X-Engine: direct" -H "X-Return-Format: html"
 */
export async function jina(url, signal) {
  const res = await fetch('https://r.jina.ai/' + url, {
    signal,
    headers: { 'X-Engine': 'direct', 'X-Return-Format': 'html' },
  });
  if (!res.ok) throw new Error('jina ' + res.status);
  return res.text();
}

/** AllOrigins — a generic CORS proxy that returns the raw HTML. */
export async function allorigins(url, signal) {
  const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url), { signal });
  if (!res.ok) throw new Error('allorigins ' + res.status);
  return res.text();
}

/** CORS.lol — another generic proxy, handy as a third option. */
export async function corsproxy(url, signal) {
  const res = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(url), { signal });
  if (!res.ok) throw new Error('corsproxy ' + res.status);
  return res.text();
}

/** Built-in proxies, by name. Reference them by string in config or pass functions. */
export const builtinProxies = { jina, allorigins, corsproxy };
