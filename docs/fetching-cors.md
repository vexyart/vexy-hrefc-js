---
title: Fetching & CORS
layout: default
nav_order: 5
permalink: /fetching-cors/
---

<!-- this_file: docs/fetching-cors.md -->

# Fetching & CORS

To preview a link, `hrefc` has to read the target page's HTML. For links on your own site, the browser hands it over. For links to someone else's site, the browser refuses — that's CORS, and it's not a bug you can fix from JavaScript. So cross-origin links take a detour: they route through a reader proxy that fetches the page server-side and returns plain HTML the browser *will* let you read.

Same-origin uses native `fetch`. Cross-origin goes through the chain. You rarely touch any of this — the defaults work — but here's the whole map.

## The default chain

Out of the box the chain is a single proxy: [`r.jina.ai`](https://r.jina.ai). It fetches the page and returns rendered HTML. The adapter is the JavaScript equivalent of this:

```bash
curl "https://r.jina.ai/https://example.com/" \
  -H "X-Engine: direct" \
  -H "X-Return-Format: html"
```

That's it — one hop, no key. If it returns usable HTML, you get a preview.

## Native vs proxy

Two settings decide when the browser is tried at all.

- **`fetch.sameOriginDirect`** (default `true`) — use native `fetch` for links on the same origin. Your own pages don't need a proxy.
- **`fetch.crossOriginStrategy`** — what to do for everyone else's pages:
  - `'proxy'` (default) — skip the browser, go straight to the chain. Cross-origin native fetches almost always fail, so this avoids a guaranteed dead request.
  - `'native-first'` — try the browser first, fall back to the chain. Worth it if the sites you link to send permissive CORS headers, since a direct hit is faster and skips the middleman.

```js
hrefc({
  fetch: { crossOriginStrategy: 'native-first' },
});
```

## Adding and reordering proxies

`fetch.proxies` is an ordered list. The chain tries each entry until one returns usable HTML; if they all strike out, the preview stays silent — no error, no card.

Three proxies are built in. Reference them by name:

| Name | Service |
|---|---|
| `'jina'` | `r.jina.ai` reader (the default) |
| `'allorigins'` | AllOrigins generic CORS proxy |
| `'corsproxy'` | corsproxy.io generic proxy |

```js
hrefc({
  fetch: { proxies: ['jina', 'allorigins', 'corsproxy'] },
});
```

Order is priority: `jina` first, the others only if it fails. Remember that arrays *replace* rather than merge — listing proxies gives you exactly that chain, not the default plus your additions.

### Custom adapters

A proxy is just a function. Give it a URL and an `AbortSignal`, return a promise of the page's HTML, and throw to fall through to the next one:

```js
async function myProxy(url, signal) {
  const res = await fetch('https://my-reader.example/?u=' + encodeURIComponent(url), { signal });
  if (!res.ok) throw new Error('myProxy ' + res.status); // throw → try the next adapter
  return res.text(); // resolve with HTML → chain stops here
}

hrefc({
  fetch: { proxies: [myProxy, 'jina'] }, // your reader first, jina as backstop
});
```

Names and functions mix freely in the same list.

## Timeouts, caching, and de-duping

- **`fetch.timeout`** (default `6500` ms) — a slow proxy gets abandoned rather than hanging the card. The pending request is aborted via its signal.
- **`cache.enabled`** (default `true`) and **`cache.max`** (default `200`) — extracted data is kept per URL, so a second hover over the same link is instant and makes no network call. The oldest entries drop once you pass `max`.
- **In-flight de-duping** — hover the same link three times before the first fetch lands and you still get one request, not three. Repeated hovers share the in-flight promise.

```js
hrefc({
  fetch: { timeout: 4000 },
  cache: { max: 50 },
});
```

{: .warning }
The built-in proxies are free public services. They rate-limit, go down, and change their behavior without warning — none of them owe you uptime. That's exactly why the chain is a list: add a fallback, swap the order, or drop in your own reader when a public one lets you down.

<iframe src="{{ '/demos/06-proxies.html' | relative_url }}" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Proxies demo"></iframe>

## Next

- [Thumbnails]({{ '/thumbnails/' | relative_url }}) — the image side of fetching.
- [Configuration]({{ '/configuration/' | relative_url }}) — every `fetch` option.
- [API reference]({{ '/api-reference/' | relative_url }}) — the `ProxyAdapter` type.
