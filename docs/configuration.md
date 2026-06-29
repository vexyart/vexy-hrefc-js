---
title: Configuration
layout: default
nav_order: 3
permalink: /configuration/
---

<!-- this_file: docs/configuration.md -->

# Configuration

Every knob lives in one object. Pass the few you care about; the rest keep their defaults.

```js
const inst = hrefc({
  trigger: 'hover',
  content: { thumbnail: true },
  popup: { theme: 'dark' },
});
```

Your object is deep-merged onto the defaults. Nested objects merge key by key, so `content: { thumbnail: true }` flips one flag and leaves `title`, `description`, and the rest alone. Arrays and scalars replace wholesale — pass `fetch.proxies` and you swap the whole chain, not append to it.

## Top-level

| Option | Default | What it does |
|---|---|---|
| `selector` | `'[data-hrefc], a.hrefc'` | CSS selector for links to preview. Opt-in by default. |
| `trigger` | `'hover'` | What opens a preview: `'hover'`, `'click'`, or `'manual'` (API only). |
| `hoverDelay` | `120` | Milliseconds of hover before fetching and showing. |
| `hideDelay` | `160` | Milliseconds after leaving before hiding. |

```js
hrefc({ trigger: 'click', hoverDelay: 200 });
```

With `trigger: 'manual'`, nothing fires on its own — you drive it with `inst.show(link)`.

## content

What goes on the card, and how the text is trimmed.

| Option | Default | What it does |
|---|---|---|
| `title` | `true` | Show the page title. |
| `description` | `true` | Show the description line. |
| `thumbnail` | `false` | Show a preview image. Opt in. |
| `favicon` | `false` | Show the site's favicon. Opt in. |
| `descriptionMaxLength` | `350` | Trim the description to this many characters. |
| `stripTitleSuffix` | `false` | Trim `"Page \| Site"` down to `"Page"`. |
| `titleSeparators` | `['\|', '–', '—', '·', '»', '::']` | Characters treated as the suffix boundary. |

```js
hrefc({
  content: { favicon: true, stripTitleSuffix: true, descriptionMaxLength: 200 },
});
```

Title and description are on out of the box; thumbnail and favicon you turn on.

<iframe src="{{ '/demos/02-description-favicon.html' | relative_url }}" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Description and favicon demo"></iframe>

## fetch

How the target page's HTML gets fetched. The browser blocks most cross-origin requests, so this is where proxies come in.

| Option | Default | What it does |
|---|---|---|
| `timeout` | `6500` | Milliseconds before a fetch is abandoned. |
| `sameOriginDirect` | `true` | Use native `fetch` for same-origin links. |
| `crossOriginStrategy` | `'proxy'` | `'proxy'` skips native and goes straight to a proxy; `'native-first'` tries the browser first. |
| `proxies` | `[jina]` | Ordered fallback chain. Use names (`'jina'`, `'allorigins'`, `'corsproxy'`) or your own adapter functions. |

```js
hrefc({
  fetch: { timeout: 4000, proxies: ['jina', 'allorigins'] },
});
```

The chain is tried in order until one returns HTML. See [Fetching & CORS]({{ '/fetching-cors/' | relative_url }}) for how proxies work and how to write your own.

## thumbnail

Where preview images come from when `content.thumbnail` is on.

| Option | Default | What it does |
|---|---|---|
| `width` | `480` | Requested image width, in pixels. |
| `providers` | `['ogimage', 'mshots', 'microlink']` | Ordered list of image sources. Names or functions. |
| `iframe` | `true` | Fall back to a click-protected live `<iframe>` if no image is found. |
| `iframeViewport` | `{ width: 1280, height: 800 }` | Viewport size used to render the iframe fallback. |

```js
hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage'], iframe: false },
});
```

More on the provider chain and the iframe fallback in [Thumbnails]({{ '/thumbnails/' | relative_url }}).

## cache

Previews are remembered per URL so a second hover is instant.

| Option | Default | What it does |
|---|---|---|
| `enabled` | `true` | Cache extracted data in memory. |
| `max` | `200` | Maximum entries before the oldest are dropped. |

```js
hrefc({ cache: { max: 50 } });
```

## popup

The card itself — size, placement, theme, and behavior.

| Option | Default | What it does |
|---|---|---|
| `maxWidth` | `360` | Maximum card width, in pixels. |
| `offset` | `12` | Gap between link and card, in pixels. |
| `placement` | `'auto'` | `'auto'`, `'top'`, or `'bottom'`. |
| `classPrefix` | `'hrefc'` | Prefix for generated class names. |
| `appendTo` | `null` | Where to mount the card; defaults to `document.body`. Element or `() => Element`. |
| `inheritFont` | `true` | Inherit the page's font. |
| `theme` | `'auto'` | `'auto'` follows the system setting; or force `'light'` / `'dark'`. |
| `injectStyles` | `true` | Inject the stylesheet automatically. |
| `interactive` | `true` | Hovering the card keeps it open; clicking it follows the link. |
| `zIndex` | `9999` | Stacking order of the card. |

```js
hrefc({
  popup: { maxWidth: 420, placement: 'top', theme: 'dark', offset: 8 },
});
```

For class names, CSS variables, and themes, see [Styling]({{ '/styling/' | relative_url }}).

## classes

Override the generated class names individually. Empty by default.

| Option | Default | What it does |
|---|---|---|
| `classes` | `{}` | Map of part to class name: `{ root, head, title, desc, thumb, ... }`. |

```js
hrefc({ classes: { root: 'card', title: 'card__title' } });
```

## render

Take over the card's markup entirely. Return an `HTMLElement`, an HTML `string`, or `null` to render nothing.

```js
hrefc({
  render: (data, link) => `
    <strong>${data.title}</strong>
    <p>${data.description}</p>
  `,
});
```

{: .warning }
A returned string is set as `innerHTML`. You own the trust — escape anything you don't control.

The `data` object is a `PreviewData`: `{ url, title, description, image, favicon }`. Full contract in the [API reference]({{ '/api-reference/' | relative_url }}).

## Hooks

Side-effect callbacks for the preview lifecycle. All default to `null`.

| Option | Default | What it does |
|---|---|---|
| `onShow` | `null` | `(data, link, popupEl) => void` — a preview appeared. |
| `onHide` | `null` | `(link) => void` — a preview was dismissed. |
| `onError` | `null` | `(error, link) => void` — a fetch failed. The UI stays silent regardless. |

```js
hrefc({
  onShow: (data) => console.log('previewed', data.url),
  onError: (err, link) => console.warn('no preview for', link.href, err),
});
```

A throw inside a hook is swallowed — hooks never break the page.
