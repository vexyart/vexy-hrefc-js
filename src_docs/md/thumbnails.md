# Thumbnails

A card can show a picture of the target page as well as text. Thumbnails are off by default because text-only cards are smaller and need fewer requests. Switch them on with:

```js
hrefc({ content: { thumbnail: true } });
```

With thumbnails on, the extractor also reads the page's image meta tags, and the card tries to show an image from a chain of providers.

## The provider chain

`vexy-hrefc` walks `thumbnail.providers` in order and uses the first provider that returns an image URL. The default chain is:

1. **`ogimage`**: the image already extracted from the page, taken from the first non-empty `og:image`, `og:image:url`, `twitter:image` or `twitter:image:src` meta tag. It costs no extra request to find.
2. **`mshots`**: a WordPress mShots screenshot, `https://s0.wp.com/mshots/v1/<encoded url>?w=<thumbnail.width>`. No key required.
3. **`microlink`**: a Microlink screenshot, `https://api.microlink.io/?url=<encoded url>&screenshot=true&embed=screenshot.url`. Uses the keyless free tier.

The chain picks a URL without loading it. `mshots` and `microlink` always return a URL, so with the default chain a page without an Open Graph image gets an `mshots` screenshot.

After the URL is chosen:

- If the image loads, it is laid out by its shape (see below).
- If the image fails to load and `thumbnail.iframe` is `true`, the image is removed and the page itself is shown in a scaled iframe.
- If no provider returned a URL and `thumbnail.iframe` is `true`, the iframe is used directly.
- Otherwise the card shows text only. No broken-image icon appears.

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

To use screenshots only and ignore Open Graph images, leave `ogimage` out of the chain:

```js
hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['mshots', 'microlink'] },
});
```

## The iframe fallback

The fallback renders the target page in an `<iframe>` at `thumbnail.iframeViewport` size (1280 × 800 by default), then scales it down with a CSS transform to the card's width. A desktop-size viewport keeps responsive sites from switching to their phone layout.

The iframe is created with `sandbox="allow-same-origin"` (so the page's scripts do not run), `scrolling="no"`, `loading="lazy"`, `aria-hidden="true"` and `tabindex="-1"`. Sites that forbid framing (through `X-Frame-Options` or a CSP `frame-ancestors` rule) show a blank frame. Set `thumbnail.iframe: false` to skip the fallback.

## Layout by shape

The image is hidden until it loads. Then its natural aspect ratio (width ÷ height) picks a layout class:

| Ratio | Typical image | Class | Layout |
|---|---|---|---|
| 1.25 (5:4) or wider | Screenshots, social cards | `.hrefc-thumb-wide` | Full width, above the title |
| Between 2:3 and 5:4 | Square-ish images | `.hrefc-thumb-half` | 50% width, floated right |
| 0.667 (2:3) or narrower | Portraits, posters | `.hrefc-thumb-float` | 33% width, floated right |

Text wraps beside floated images. Override any of these classes to change the layout.

## Custom providers

A provider is a function `(url, data, opts) => string | null`. It receives the page URL, the extracted `data` and the resolved `thumbnail` options. Return an image URL to use it, or `null` to pass to the next provider.

```js
function myShot(url) {
  return 'https://my-screenshots.example/?url=' + encodeURIComponent(url);
}

hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage', myShot] },
});
```

### Paid screenshot APIs

The keyless services suit low traffic. For faster and more reliable screenshots, use a paid screenshot API with your own key. The provider just builds the URL that service documents:

```js
const KEY = '...'; // your key
function paidShot(url, _data, opts) {
  return 'https://api.example-screenshots.com/take'
    + '?access_key=' + KEY
    + '&url=' + encodeURIComponent(url)
    + '&viewport_width=' + (opts.width || 480);
}

hrefc({
  content: { thumbnail: true },
  thumbnail: { providers: ['ogimage', paidShot] },
});
```

The host and parameter names above are placeholders; use the ones your provider documents. Keys used in browser code are visible to anyone who reads the page source.

!!! note
    The title and description appear as soon as the HTML is parsed. The image loads after that, and the card re-positions itself once the image size is known.

## Favicons

A favicon is a small site icon shown before the title, separate from the thumbnail. Enable it with:

```js
hrefc({ content: { favicon: true } });
```

The extractor looks at every `<link>` whose `rel` contains `icon` and picks the one with the largest `sizes` value. If the page declares no icon, it uses `/favicon.ico` on the target's origin. If the favicon image fails to load, it is removed from the card.

Favicons and thumbnails are independent options; use either, both or neither.

<iframe src="../demos/03-thumbnails.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Thumbnails demo"></iframe>
