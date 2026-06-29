---
title: Thumbnails
layout: default
nav_order: 6
permalink: /thumbnails/
---

<!-- this_file: docs/thumbnails.md -->

# Thumbnails

A card can carry a picture of the page, not just words about it. Thumbnails are off by default — text-only cards are smaller and faster — so you opt in:

```js
hrefc({ content: { thumbnail: true } });
```

Now every preview tries to find an image, working cheapest-to-priciest down a chain until something sticks.

## The provider chain

`hrefc` walks `thumbnail.providers` in order and uses the first one that returns an image URL. The default chain, in order:

1. **`ogimage`** — the `og:image` or `twitter:image` already pulled from the page. Free, instant, and what most sites publish. No network call beyond the one you already made.
2. **`mshots`** — WordPress mShots, a keyless cached screenshot service. Renders the page and hands back a real picture of it.
3. **`microlink`** — Microlink's keyless free tier, another live screenshot source.
4. **iframe fallback** — if no image turns up *and* `thumbnail.iframe` is on, the page is rendered in a click-protected sandboxed `<iframe>` at desktop size, scaled down to fit the card.
5. **nothing** — if all of that fails, the card simply shows text. No broken-image icon, no placeholder.

```js
hrefc({
  content: { thumbnail: true },
  thumbnail: {
    width: 480,
    providers: ['ogimage', 'mshots', 'microlink'],
    iframe: true,
    iframeViewport: { width: 1280, height: 800 },
  },
});
```

- **`thumbnail.width`** — requested image width in pixels. Bigger is sharper and slower.
- **`thumbnail.providers`** — names, functions, or a mix. Order is priority.
- **`thumbnail.iframe`** — the last-resort live render. Set `false` to skip it and let the card go text-only when no real image exists.
- **`thumbnail.iframeViewport`** — the viewport the iframe renders at before scaling. The default desktop size keeps mobile-first layouts from collapsing into a phone view.

Want screenshots only, no Open Graph image? Reorder the chain:

```js
hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['mshots', 'microlink'] },
});
```

## Layout by shape

The card lays the image out by its aspect ratio, measured once it loads:

- **3:2 or wider** (screenshots, social cards) → full width, above the title (class `.hrefc-thumb-wide`).
- **Narrower than 3:2** (portraits, posters) → 33% width, floated right, with the text wrapping beside it (class `.hrefc-thumb-float`).

Restyle either with those classes — e.g. change the float width or drop it to full width.

## Custom providers

A provider is a function: take the page URL, the extracted `data`, and the thumbnail options, and return an image URL — or `null` to pass to the next one.

```js
function gradientShot(url) {
  // return a string to use it, or null to skip to the next provider
  return 'https://my-screenshots.example/?url=' + encodeURIComponent(url);
}

hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage', gradientShot] },
});
```

### Paid screenshot APIs

The keyless defaults are fine for low traffic and tolerant of the occasional miss. For reliable, fast screenshots, a paid API (ScreenshotOne, ApiFlash, and others) is the usual upgrade — bring your own key. The shape is the same; you're just building the URL their docs specify:

```js
const KEY = '...'; // your key
function paidShot(url, _data, opts) {
  const w = opts.width || 480;
  return 'https://api.example-screenshots.com/take'
    + '?access_key=' + KEY
    + '&url=' + encodeURIComponent(url)
    + '&viewport_width=' + w;
}

hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage', paidShot] },
});
```

(That's the pattern, not a recommendation of any one service — pick whichever fits your budget and rate limits.)

{: .note }
A thumbnail makes the card noticeably taller, and the image arrives *after* the text. The title and description show as soon as they're parsed; the picture fades in once it loads. That's deliberate — you read the card without waiting on a screenshot.

## Favicons

A favicon is a different thing from a thumbnail: a small site icon shown next to the title, not a picture of the page. Enable it separately:

```js
hrefc({ content: { favicon: true } });
```

Resolution order is the page's declared icon (`<link rel="icon">` and friends) first, then a fall back to `/favicon.ico` at the site root. If neither exists, the favicon slot is simply absent.

You can run favicons and thumbnails together, or either alone — they're independent toggles.

<iframe src="{{ '/demos/03-thumbnails.html' | relative_url }}" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Thumbnails demo"></iframe>

## Next

- [Styling]({{ '/styling/' | relative_url }}) — size and frame the thumbnail.
- [Fetching & CORS]({{ '/fetching-cors/' | relative_url }}) — how the page gets read in the first place.
- [API reference]({{ '/api-reference/' | relative_url }}) — the `ThumbnailProvider` type.
