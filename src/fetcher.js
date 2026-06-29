//! this_file: src/fetcher.js
import { isSameOrigin, withTimeout } from './util.js';
import { extract } from './extract.js';
import { builtinProxies } from './proxies.js';

/** Tiny LRU: a Map capped at `max`, evicting the oldest entry. */
function makeCache(max) {
  const map = new Map();
  return {
    has: (k) => map.has(k),
    get: (k) => map.get(k),
    set: (k, v) => {
      if (map.has(k)) map.delete(k);
      map.set(k, v);
      if (map.size > max) map.delete(map.keys().next().value);
    },
    clear: () => map.clear(),
  };
}

/** Resolve a proxy entry (string name or function) to a function. */
function resolveProxy(p) {
  if (typeof p === 'function') return p;
  return builtinProxies[p] || null;
}

/**
 * Build a fetcher bound to a config. `getData(url)` returns a Promise of
 * extracted preview data, with caching and in-flight de-duplication.
 */
export function createFetcher(config) {
  const cacheEnabled = config.cache && config.cache.enabled !== false;
  const cache = makeCache((config.cache && config.cache.max) || 200);
  const pending = new Map();

  const { timeout, sameOriginDirect, crossOriginStrategy } = config.fetch;
  const proxies = (config.fetch.proxies || []).map(resolveProxy).filter(Boolean);

  async function getHtml(url) {
    const attempts = [];
    const sameOrigin = isSameOrigin(url);
    const tryNative = sameOrigin ? sameOriginDirect !== false : crossOriginStrategy === 'native-first';

    if (tryNative) {
      attempts.push(async (signal) => {
        const res = await fetch(url, { signal, credentials: 'omit' });
        if (!res.ok) throw new Error('native ' + res.status);
        return { html: await res.text(), finalUrl: res.url || url };
      });
    }
    for (const proxy of proxies) {
      attempts.push(async (signal) => ({ html: await proxy(url, signal), finalUrl: url }));
    }

    let lastErr;
    for (const attempt of attempts) {
      try {
        return await withTimeout(attempt, timeout);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('no fetch strategy available');
  }

  function getData(url) {
    if (cacheEnabled && cache.has(url)) return Promise.resolve(cache.get(url));
    if (pending.has(url)) return pending.get(url);

    const p = (async () => {
      const { html, finalUrl } = await getHtml(url);
      const data = extract(html, finalUrl, config.content);
      if (!data.title && !data.description && !data.image) {
        throw new Error('nothing worth showing');
      }
      if (cacheEnabled) cache.set(url, data);
      return data;
    })();

    pending.set(url, p);
    p.catch(() => {}).finally(() => pending.delete(url));
    return p;
  }

  return { getData, getHtml, cache };
}
