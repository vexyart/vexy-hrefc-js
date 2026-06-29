---
title: API reference
layout: default
nav_order: 7
permalink: /api-reference/
---

<!-- this_file: docs/api-reference.md -->

# API reference

Three ways in, five methods out, and a handful of exports. That's the surface.

## Creating an instance

### `hrefc(config?)` → `Hrefc`

The one most people want. Creates a running instance and scans the DOM.

```js
import { hrefc } from 'vexy-hrefc';

const inst = hrefc({ selector: 'a.preview' });
```

### `new Hrefc(config?)` → `Hrefc`

The class behind it. `hrefc(config)` is just `new Hrefc(config)`.

```js
import { Hrefc } from 'vexy-hrefc';

const inst = new Hrefc({ trigger: 'click' });
```

### `auto()` → `Hrefc`

Starts from `window.HrefcConfig` if it's set, otherwise the defaults. Built for the script-tag crowd who can't pass an argument.

```html
<script>
  window.HrefcConfig = { content: { thumbnail: true } };
</script>
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<script>
  Hrefc.auto();
</script>
```

## Instance methods

| Method | Signature | What it does |
|---|---|---|
| `refresh` | `refresh(root = document)` → `this` | Rescan `root` and attach to any new matching links. |
| `add` | `add(target)` → `this` | Attach to one Element or a list of Elements, no rescan. |
| `show` | `show(link)` → `Promise<void> \| undefined` | Force a preview for `link`, bypassing hover intent. |
| `hide` | `hide()` → `this` | Hide the current popup now. |
| `destroy` | `destroy()` → `void` | Remove every listener and the popup element. |

```js
const inst = hrefc();

inst.refresh();             // after injecting links
inst.add(document.querySelector('#late-link'));
await inst.show(myLink);    // manual trigger
inst.hide();
inst.destroy();             // tear it all down
```

`refresh`, `add`, and `hide` return the instance, so they chain.

## Exports

Available as named ESM exports and as properties on the global `Hrefc`.

| Export | Type | What it is |
|---|---|---|
| `defaults` | `HrefcConfig` | The full default config object. |
| `proxies` | `{ jina, allorigins, corsproxy }` | Built-in fetch proxy adapters. |
| `thumbnailProviders` | `Record<string, ThumbnailProvider>` | Built-in thumbnail providers (`ogimage`, `mshots`, `microlink`). |
| `Hrefc` | `class` | The instance class. |

```js
import { hrefc, defaults, proxies, thumbnailProviders, Hrefc } from 'vexy-hrefc';

hrefc({ fetch: { proxies: [proxies.allorigins, proxies.corsproxy] } });
```

## PreviewData

The shape extracted from a target page and passed to `render`, `onShow`, and thumbnail providers.

| Field | Type | What it holds |
|---|---|---|
| `url` | `string` | The resolved target URL. |
| `title` | `string` | Page title (Open Graph first, then `<title>`). |
| `description` | `string` | Description line, trimmed to `descriptionMaxLength`. |
| `image` | `string` | Preview image URL, or empty. |
| `favicon` | `string` | Favicon URL, or empty. |

## render(data, link)

Replace the card's markup. Return one of three things:

- an `HTMLElement` — mounted as-is,
- a `string` — set as `innerHTML`,
- `null` — render nothing.

```js
hrefc({
  render: (data, link) => {
    const el = document.createElement('div');
    el.textContent = data.title;
    return el;
  },
});
```

{: .warning }
A returned string is injected as `innerHTML`. Escape any field you don't fully trust — `render` hands you the keys.

## Hooks

Lifecycle callbacks. Each is optional and defaults to `null`.

| Hook | Signature | Fires when |
|---|---|---|
| `onShow` | `(data, link, popupEl) => void` | A preview appears. |
| `onHide` | `(link) => void` | A preview is dismissed. |
| `onError` | `(error, link) => void` | A fetch fails. |

```js
hrefc({
  onShow: (data, link, popupEl) => track('preview', data.url),
  onHide: (link) => track('dismiss'),
  onError: (err, link) => console.warn(err),
});
```

{: .note }
The UI stays silent no matter what a hook does, and a hook that throws is swallowed. They observe; they never break the page.

## Adapter signatures

Plug your own logic into the fetch and thumbnail chains. Details in [Fetching & CORS]({{ '/fetching-cors/' | relative_url }}) and [Thumbnails]({{ '/thumbnails/' | relative_url }}).

```ts
type ProxyAdapter = (url: string, signal: AbortSignal) => Promise<string>;
type ThumbnailProvider = (url: string, data: PreviewData, opts: ThumbnailConfig) => string | null;
```

A `ProxyAdapter` returns the target's HTML or throws to fall through to the next. A `ThumbnailProvider` returns an image URL or `null` to skip to the next.

## Global vs ESM names

Same thing, two entry points.

| ESM import | Global | Notes |
|---|---|---|
| `hrefc()` | `Hrefc()` | The global `Hrefc` **is** the function. |
| `hrefc.init` | `Hrefc.init` | Alias of the function. |
| `auto()` | `Hrefc.auto()` | Reads `window.HrefcConfig`. |
| `defaults` | `Hrefc.defaults` | Default config. |
| `proxies` | `Hrefc.proxies` | Proxy adapters. |
| `thumbnailProviders` | `Hrefc.thumbnails` | Thumbnail providers. |
| `Hrefc` | `Hrefc.Hrefc` | The class. |
