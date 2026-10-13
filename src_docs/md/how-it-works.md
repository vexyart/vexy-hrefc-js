# How it works

This page follows one hover from the pointer event to the visible card, module by module. The source lives in `src/`.

| Module | Responsibility |
|---|---|
| `index.js` | The `Hrefc` class: link discovery, event listeners, timers, hooks. |
| `config.js` | The `defaults` object and the deep merge (`mergeConfig`, `resolveConfig`). |
| `fetcher.js` | Fetch attempts, timeouts, the LRU cache, in-flight de-duplication. |
| `proxies.js` | The built-in proxy adapters `jina`, `allorigins`, `corsproxy`. |
| `extract.js` | HTML parsing and metadata extraction. |
| `thumbnail.js` | The thumbnail provider chain `ogimage`, `mshots`, `microlink`. |
| `popup.js` | The single popup element: content, positioning, show and hide. |
| `styles.js` | The default stylesheet and its one-time injection. |
| `util.js` | URL helpers and `withTimeout`. |

## 1. Start-up

`hrefc(config)` calls `new Hrefc(config)`. The constructor:

1. Merges your options onto `defaults`.
2. Creates one fetcher and one popup for the instance. The popup injects the default stylesheet into `<head>` once per class prefix, unless `popup.injectStyles` is `false`.
3. Runs `refresh()`, which calls `document.querySelectorAll(selector)` and attaches listeners to each match. Attached links are tracked in a `WeakSet`, so a link is never attached twice.
4. Adds passive `scroll` and `resize` listeners on `window` that re-position a visible card.

## 2. Hover intent

With `trigger: 'hover'`, `pointerenter` or `focus` on a link records it as the *desired* link and starts a `hoverDelay` timer (120 ms). Leaving the link (`pointerleave` or `blur`) clears the desired link, cancels the timer, and starts a `hideDelay` timer (160 ms).

When the hover timer fires, the instance resolves the `href` against `location.href`. Links with no `href`, or an `href` that cannot be parsed as a URL, are ignored.

## 3. Fetch

`fetcher.getData(url)` returns a promise of preview data:

1. A cached result is returned immediately.
2. A request already in flight for the same URL is shared.
3. Otherwise the attempt list runs: native `fetch` (when allowed), then each proxy. Each attempt is wrapped in `withTimeout`, which aborts it through an `AbortController` after `fetch.timeout` ms.

Details are on the [Fetching and CORS](fetching-cors.md) page.

## 4. Extraction

The HTML is parsed with `DOMParser` and `extractMeta()` fills a `PreviewData` object:

| Field | Sources, in order |
|---|---|
| `title` | `og:title`, `twitter:title`, `<title>`. Optional suffix stripping. |
| `description` | `og:description`, `twitter:description`, `meta name="description"`, then the body text with `script`, `style`, `noscript`, `template` and `svg` removed, cut to `descriptionMaxLength`. Skipped when `content.description` is `false`. |
| `image` | `og:image`, `og:image:url`, `twitter:image`, `twitter:image:src`. Only when `content.thumbnail` is on. Made absolute. |
| `favicon` | Largest `<link rel="…icon…">`, else `/favicon.ico`. Only when `content.favicon` is on. Made absolute. |
| `url` | The response URL for native fetches (after redirects), or the requested URL for proxies. |

If `title`, `description` and `image` are all empty, the result is rejected as "nothing worth showing" and not cached.

### Example

Given this target HTML:

```html
<html>
  <head>
    <title>Refunds | Acme Help</title>
    <meta name="description" content="How to get your money back.">
  </head>
  <body>…</body>
</html>
```

With `content: { stripTitleSuffix: true }`, the extracted data is:

```js
{
  url: 'https://help.acme.example/refunds',
  title: 'Refunds',
  description: 'How to get your money back.',
  image: '',
  favicon: '',
}
```

## 5. Showing the card

When the data arrives, the instance checks that the link is still the desired one. If you have already moved to another link, the stale result is dropped. Click triggers and `show()` calls skip this check.

The popup then:

1. Creates its element on first use and appends it to `popup.appendTo` (default `document.body`). One element is reused for every link.
2. Fills the card from `render()` or from the default layout.
3. Measures the link and the card, picks a side (above unless there is no room), centres the card over the link, and clamps it 8 px inside the viewport.
4. Points the arrow at the link's horizontal centre.
5. On the next animation frame, positions again and sets `data-show="1"`, which triggers the CSS fade-in.

`onShow(data, link, popupEl)` is then called.

## 6. Hiding

When the hide timer fires and the pointer is not over the card, `data-show` is removed and `onHide(link)` is called. With `popup.interactive` on, entering the card cancels the hide timer, and leaving it starts the timer again. Clicking the card navigates to the link's `href`, unless the click landed on a link or button inside the card.

## Failure handling

Any error in fetching or extraction ends the promise chain quietly: no card appears, and `onError(error, link)` is called. Errors thrown by hooks are caught and ignored.
