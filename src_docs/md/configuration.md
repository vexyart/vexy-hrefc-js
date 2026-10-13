# Configuration

All options live in one object passed to `hrefc(config)`, `new Hrefc(config)` or `window.HrefcConfig`. Pass only the options you want to change; the rest keep their defaults.

```js
const inst = hrefc({
  trigger: 'hover',
  content: { thumbnail: true },
  popup: { theme: 'dark' },
});
```

## How your options are merged

Your object is deep-merged onto the defaults by `mergeConfig()`:

- Nested plain objects merge key by key. `content: { thumbnail: true }` changes one flag and leaves `title`, `description` and the other `content` keys at their defaults.
- Arrays and scalar values replace the default. Passing `fetch.proxies: ['allorigins']` gives you a chain of exactly one proxy; it does not append to the default chain.

The defaults object itself is never modified. You can read it as `defaults` (ESM) or `Hrefc.defaults` (global).

## Top-level options

| Option | Default | Effect |
|---|---|---|
| `selector` | `'[data-hrefc], a.hrefc'` | CSS selector for the links that get previews. |
| `trigger` | `'hover'` | What opens a preview: `'hover'`, `'click'` or `'manual'`. |
| `hoverDelay` | `120` | Milliseconds the pointer must rest on a link before the fetch starts. |
| `hideDelay` | `160` | Milliseconds after the pointer leaves before the card hides. |

The three triggers attach different listeners:

- `'hover'` listens for `pointerenter`, `pointerleave`, `focus` and `blur`, so keyboard focus also opens a preview.
- `'click'` listens for `click`, prevents the default navigation, and shows the preview.
- `'manual'` attaches no listeners. Open previews from your own code with `inst.show(link)`.

```js
hrefc({ trigger: 'click', hideDelay: 300 });
```

## content

What goes on the card, and how text is trimmed.

| Option | Default | Effect |
|---|---|---|
| `title` | `true` | Show the page title. |
| `description` | `true` | Show the description line. |
| `thumbnail` | `false` | Extract an image and show a thumbnail. See [Thumbnails](thumbnails.md). |
| `favicon` | `false` | Show the site's favicon next to the title. |
| `cta` | `null` | Footer text below the description, for example `'Click to read more'`. HTML is allowed. Rendered with the class `hrefc-cta`. |
| `descriptionMaxLength` | `350` | Maximum length of a description taken from the page body text. |
| `stripTitleSuffix` | `false` | Cut the title at the first separator, so `"Refunds \| Acme Help"` becomes `"Refunds"`. |
| `titleSeparators` | `['\|', '–', '—', '·', '»', '::']` | Separators checked, in order, when `stripTitleSuffix` is on. |

`descriptionMaxLength` applies only to the body-text fallback. A description taken from a `<meta>` tag is used as written. When the body text is longer than the limit, it is cut and an ellipsis (`…`) is appended.

`stripTitleSuffix` checks the separators in the order listed and cuts at the first one found after the first character. Title `"Docs · Getting started | Acme"` with the default list becomes `"Docs · Getting started"`, because `|` is checked before `·`.

```js
hrefc({
  content: { favicon: true, stripTitleSuffix: true, cta: 'Click to read more →' },
});
```

<iframe src="../demos/02-description-favicon.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Description and favicon demo"></iframe>

## fetch

How the target page's HTML is fetched. See [Fetching and CORS](fetching-cors.md) for the full picture.

| Option | Default | Effect |
|---|---|---|
| `timeout` | `6500` | Milliseconds before a single fetch attempt is aborted. |
| `sameOriginDirect` | `true` | Use the browser's `fetch` for same-origin links. |
| `crossOriginStrategy` | `'proxy'` | `'proxy'` sends cross-origin links straight to the proxy chain. `'native-first'` tries the browser's `fetch` first. |
| `proxies` | `[jina]` | Ordered proxy chain. Entries are names (`'jina'`, `'allorigins'`, `'corsproxy'`) or adapter functions. |

```js
hrefc({
  fetch: { timeout: 4000, proxies: ['jina', 'allorigins'] },
});
```

## thumbnail

Where images come from when `content.thumbnail` is `true`.

| Option | Default | Effect |
|---|---|---|
| `width` | `480` | Width passed to the `mshots` screenshot service, in pixels. |
| `providers` | `['ogimage', 'mshots', 'microlink']` | Ordered list of image providers. Names or functions. |
| `iframe` | `true` | Fall back to a scaled, sandboxed `<iframe>` of the page when no image can be shown. |
| `iframeViewport` | `{ width: 1280, height: 800 }` | Size at which the fallback iframe renders the page before it is scaled down. |

```js
hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage'], iframe: false },
});
```

## cache

Extracted preview data is kept in memory per URL.

| Option | Default | Effect |
|---|---|---|
| `enabled` | `true` | Cache extracted data. |
| `max` | `200` | Maximum number of entries. Adding one more evicts the least recently stored entry. |

```js
hrefc({ cache: { max: 50 } });
```

## popup

The card: size, placement, theme and behaviour.

| Option | Default | Effect |
|---|---|---|
| `maxWidth` | `360` | Maximum card width, in pixels. |
| `offset` | `12` | Gap between the link and the card, in pixels. |
| `placement` | `'auto'` | `'auto'` places the card above the link and flips it below only when there is no room above. `'top'` and `'bottom'` force a side. |
| `arrow` | `true` | Show the connector arrow that points from the card to the link. |
| `classPrefix` | `'hrefc'` | Prefix for every generated class name. |
| `appendTo` | `null` | Element (or function returning an element) the card is mounted in. `null` means `document.body`. |
| `inheritFont` | `true` | Use the page's font. When `false`, the card uses a system UI font stack. |
| `theme` | `'auto'` | `'auto'` follows the system colour scheme. `'light'` or `'dark'` pins it. |
| `injectStyles` | `true` | Insert the default stylesheet into `<head>`. |
| `interactive` | `true` | Moving the pointer onto the card keeps it open, and clicking the card follows the link. |
| `zIndex` | `9999` | Stacking order of the card. |

In every placement, the card is centred horizontally over the link and then clamped so it stays at least 8 px inside the viewport.

```js
hrefc({
  popup: { maxWidth: 420, placement: 'top', theme: 'dark', offset: 8 },
});
```

Class names, CSS variables and themes are covered in [Styling](styling.md).

## classes

Override individual generated class names. Empty by default. The keys are:

`popup`, `card`, `arrow`, `head`, `favicon`, `title`, `desc`, `cta`, `thumb`, `thumbWide`, `thumbHalf`, `thumbFloat`, `frame`.

```js
hrefc({ classes: { card: 'card', title: 'card__title', desc: 'card__body' } });
```

!!! note
    The default stylesheet uses `classPrefix` and does not know about names set in `classes`. Parts you rename this way need your own CSS.

## render

Replace the card's contents. `render(data, link)` receives the extracted data and the link element.

- If it returns a DOM `Node`, that node is placed in the card.
- Otherwise the return value is converted to a string and set as the `innerHTML` of a wrapper `<div>`. `null` or `undefined` give an empty card.

```js
hrefc({
  render: (data, link) => {
    const el = document.createElement('strong');
    el.textContent = data.title;
    return el;
  },
});
```

!!! warning
    A returned string is set as `innerHTML`. Escape any field you do not control.

The `data` object has the fields `url`, `title`, `description`, `image` and `favicon`. See the [API reference](api-reference.md#previewdata).

## Hooks

Callbacks for the preview lifecycle. All default to `null`.

| Option | Signature | Called when |
|---|---|---|
| `onShow` | `(data, link, popupEl) => void` | A card was shown. |
| `onHide` | `(link) => void` | The card was hidden after the pointer left. |
| `onError` | `(error, link) => void` | A fetch failed, or the page had no title, description or image. |

```js
hrefc({
  onShow: (data) => console.log('previewed', data.url),
  onError: (err, link) => console.warn('no preview for', link.href, err),
});
```

An exception thrown inside a hook is caught and ignored, so a broken hook cannot break the page.
