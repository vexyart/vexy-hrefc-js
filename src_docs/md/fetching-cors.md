# Fetching and CORS

To build a preview, `vexy-hrefc` must read the target page's HTML. For links on your own site, the browser allows it. For links to other sites, the browser usually refuses: that is CORS (cross-origin resource sharing), and JavaScript on your page cannot override it. Cross-origin links therefore go through a reader proxy, a service that fetches the page on its server and returns the HTML with headers the browser accepts.

## Which route a link takes

For each link, the fetcher builds an ordered list of attempts:

1. **Native `fetch`**, included only when:
    - the link is same-origin and `fetch.sameOriginDirect` is `true` (default), or
    - the link is cross-origin and `fetch.crossOriginStrategy` is `'native-first'`.
2. **Each proxy in `fetch.proxies`**, in order.

The attempts run one after another. The first one that returns HTML wins. Each attempt gets its own `fetch.timeout` (6500 ms by default); when it expires, the request is aborted through its `AbortSignal` and the next attempt starts. If every attempt fails, the preview stays hidden and `onError` is called.

Native requests are sent with `credentials: 'omit'`, so cookies are not included.

### Example

You hover `https://en.wikipedia.org/wiki/Hyperlink` on `https://example.com` with the default configuration:

1. The link is cross-origin and the strategy is `'proxy'`, so no native attempt is made.
2. The `jina` adapter requests `https://r.jina.ai/https://en.wikipedia.org/wiki/Hyperlink`.
3. The response HTML is parsed, and the `og:title` and `og:description` become the card text.
4. The result is cached under the link's absolute URL.

## The default proxy

The default chain contains one proxy, `jina`, which uses [`r.jina.ai`](https://r.jina.ai). The adapter is the JavaScript equivalent of:

```bash
curl "https://r.jina.ai/https://example.com/" \
  -H "X-Engine: direct" \
  -H "X-Return-Format: html"
```

It needs no API key.

## Native first

Set `fetch.crossOriginStrategy` to `'native-first'` if the sites you link to send permissive CORS headers. A direct request is faster and skips the proxy; when it fails, the proxy chain still runs.

```js
hrefc({
  fetch: { crossOriginStrategy: 'native-first' },
});
```

## Add and reorder proxies

Three proxies are built in. Refer to them by name:

| Name | Request sent |
|---|---|
| `'jina'` | `https://r.jina.ai/<url>` with `X-Engine: direct` and `X-Return-Format: html` |
| `'allorigins'` | `https://api.allorigins.win/raw?url=<encoded url>` |
| `'corsproxy'` | `https://corsproxy.io/?url=<encoded url>` |

```js
hrefc({
  fetch: { proxies: ['jina', 'allorigins', 'corsproxy'] },
});
```

Order is priority. Because arrays replace rather than merge, this list is the whole chain. Unknown names are dropped.

### Write your own adapter

An adapter is an async function `(url, signal) => Promise<string>`. Resolve with the page's HTML to stop the chain; throw to pass to the next adapter.

```js
async function myProxy(url, signal) {
  const res = await fetch('https://my-reader.example/?u=' + encodeURIComponent(url), { signal });
  if (!res.ok) throw new Error('myProxy ' + res.status); // try the next adapter
  return res.text(); // HTML: the chain stops here
}

hrefc({
  fetch: { proxies: [myProxy, 'jina'] },
});
```

Pass the `signal` to your `fetch` call so the timeout can cancel it. Names and functions can be mixed in one list. The built-in adapters are also exported as `proxies.jina`, `proxies.allorigins` and `proxies.corsproxy`.

## Caching and de-duplication

- **Cache.** With `cache.enabled` (default `true`), extracted data is stored per URL, up to `cache.max` entries (default `200`). A second hover over the same link shows the card without a network request.
- **In-flight de-duplication.** If you hover the same link several times before the first fetch finishes, all hovers share one request.
- **Empty results.** A page with no title, no description and no image counts as a failure. It is not cached, so a later hover tries again.

```js
hrefc({
  fetch: { timeout: 4000 },
  cache: { max: 50 },
});
```

!!! warning
    The built-in proxies are free public services. They can rate-limit, go offline or change behaviour without notice. Keep a fallback in the chain, or put your own reader first.

<iframe src="../demos/06-proxies.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Proxies demo"></iframe>
