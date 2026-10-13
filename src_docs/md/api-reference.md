# API reference

The public surface: three ways to create an instance, five instance methods, and a few exports. Type definitions ship as `dist/hrefc.d.ts`.

## Create an instance

### `hrefc(config?)` → `Hrefc`

Creates a running instance and scans the document. `hrefc.init` is an alias.

```js
import { hrefc } from 'vexy-hrefc';

const inst = hrefc({ selector: 'a.preview' });
```

### `new Hrefc(config?)` → `Hrefc`

The class behind `hrefc()`. `hrefc(config)` returns `new Hrefc(config)`.

```js
import { Hrefc } from 'vexy-hrefc';

const inst = new Hrefc({ trigger: 'click' });
```

### `auto()` → `Hrefc`

Creates an instance from `window.HrefcConfig`, or from the defaults when that is not set. Intended for script-tag use.

```html
<script>
  window.HrefcConfig = { content: { thumbnail: true } };
</script>
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<script>
  Hrefc.auto();
</script>
```

## Instance properties and methods

| Member | Signature | Effect |
|---|---|---|
| `config` | object | The resolved configuration. |
| `refresh` | `refresh(root = document)` → `this` | Scan `root` for matching links and attach to new ones. |
| `add` | `add(target)` → `this` | Attach to one `Element` or an array-like list of elements, without a scan. |
| `show` | `show(link)` → `Promise<void> \| undefined` | Fetch and show the preview for `link`, bypassing hover intent. Returns `undefined` when the link has no usable `href`. |
| `hide` | `hide()` → `this` | Hide the card now. Does not call `onHide`. |
| `destroy` | `destroy()` → `void` | Cancel timers, remove the `window` scroll and resize listeners, and remove the popup element. |

```js
const inst = hrefc();

inst.refresh();                                  // after inserting links
inst.add(document.querySelector('#late-link'));
await inst.show(myLink);                         // manual trigger
inst.hide();
inst.destroy();
```

`refresh`, `add` and `hide` return the instance, so calls can be chained.

!!! note
    `destroy()` forgets which links were attached but does not remove the listeners already on those links. Do not reuse a destroyed instance; create a new one.

## Exports

Named ES module exports. The default export is `hrefc`.

| Export | Type | Contents |
|---|---|---|
| `hrefc` | function | Create an instance. |
| `auto` | function | Create an instance from `window.HrefcConfig`. |
| `Hrefc` | class | The instance class. |
| `defaults` | object | The default configuration. |
| `proxies` | object | Built-in proxy adapters `jina`, `allorigins`, `corsproxy`. |
| `thumbnailProviders` | object | Built-in thumbnail providers `ogimage`, `mshots`, `microlink`. |

```js
import { hrefc, defaults, proxies, thumbnailProviders, Hrefc } from 'vexy-hrefc';

hrefc({ fetch: { proxies: [proxies.allorigins, proxies.corsproxy] } });
```

## Global and ESM names

The global build sets `window.Hrefc` to the `hrefc` function and copies the named exports onto it.

| ESM | Global | Notes |
|---|---|---|
| `hrefc()` | `Hrefc()` | The global `Hrefc` is the function. |
| `hrefc.init` | `Hrefc.init` | Alias. |
| `auto()` | `Hrefc.auto()` | Reads `window.HrefcConfig`. |
| `defaults` | `Hrefc.defaults` | Default configuration. |
| `proxies` | `Hrefc.proxies` | Proxy adapters. |
| `thumbnailProviders` | `Hrefc.thumbnails` or `Hrefc.thumbnailProviders` | Thumbnail providers. |
| `Hrefc` | `Hrefc.Hrefc` | The class. |

## PreviewData

The object extracted from a target page and passed to `render`, `onShow` and thumbnail providers.

| Field | Type | Contents |
|---|---|---|
| `url` | `string` | The page URL. |
| `title` | `string` | Page title, from Open Graph, Twitter card or `<title>`. |
| `description` | `string` | Description from meta tags, or trimmed body text. |
| `image` | `string` | Absolute image URL, or `''`. Filled only when `content.thumbnail` is on. |
| `favicon` | `string` | Absolute favicon URL, or `''`. Filled only when `content.favicon` is on. |

## render(data, link)

Replaces the card's contents. Return a DOM `Node` to insert it directly. Any other value is converted to a string and set as `innerHTML`; `null` and `undefined` give an empty card.

```js
hrefc({
  render: (data, link) => {
    const el = document.createElement('div');
    el.textContent = data.title;
    return el;
  },
});
```

!!! warning
    A returned string is set as `innerHTML`. Escape any field you do not control.

## Hooks

| Hook | Signature | Called when |
|---|---|---|
| `onShow` | `(data, link, popupEl) => void` | A card is shown. |
| `onHide` | `(link) => void` | The card hides after the pointer leaves. |
| `onError` | `(error, link) => void` | Fetching or extraction failed. |

```js
hrefc({
  onShow: (data, link, popupEl) => console.log('shown', data.url),
  onHide: (link) => console.log('hidden'),
  onError: (err, link) => console.warn(err),
});
```

Exceptions thrown in hooks are caught and ignored.

## Adapter signatures

```ts
type ProxyAdapter = (url: string, signal: AbortSignal) => Promise<string>;
type ThumbnailProvider = (url: string, data: PreviewData, opts: ThumbnailConfig) => string | null;
```

A `ProxyAdapter` resolves with the target's HTML or throws to pass to the next adapter. A `ThumbnailProvider` returns an image URL or `null` to pass to the next provider. See [Fetching and CORS](fetching-cors.md) and [Thumbnails](thumbnails.md).
