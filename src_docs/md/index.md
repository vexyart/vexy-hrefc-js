# vexy-hrefc

Point at a link and a small card fades in above it, centred over the link, with a connector arrow. The card shows the target page's title and a line about it. Move the pointer away and the card disappears.

`vexy-hrefc` is a client-side link-preview library in one file, with no runtime dependencies. It reads Open Graph tags first and falls back to plainer HTML. When the browser blocks a cross-origin request, it routes the request through a reader proxy instead. Failures are silent by design: if a preview cannot be built, nothing appears.

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<a class="hrefc" href="https://en.wikipedia.org/wiki/Hyperlink">hyperlink</a>
<script>
  Hrefc();
</script>
```

That is a working preview. See it run in the [basic demo](demos/01-basic.html).

<iframe src="demos/01-basic.html" style="width:100%;height:420px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Basic demo"></iframe>

## What happens when you hover a link

1. You call `Hrefc()` (or `hrefc()` from the ESM build). It finds every link that matches `[data-hrefc], a.hrefc` and attaches pointer and focus listeners.
2. You hover a link for 120 ms (`hoverDelay`). The library resolves the link's `href` to an absolute URL.
3. It fetches the target page's HTML. Same-origin links use the browser's `fetch`. Cross-origin links go through the proxy chain, which is `r.jina.ai` by default.
4. It parses the HTML and extracts a title, a description, and optionally an image and a favicon.
5. If at least a title, description or image was found, the card is filled and fades in. Otherwise nothing is shown.
6. The result is cached per URL, so the next hover over the same link shows the card without a network request.

[How it works](how-it-works.md) covers each step in detail.

## Why it exists

The first version lived inside a Webflow page and used Tippy.js and Popper loaded from a CDN. It worked until a link pointed to another site and CORS blocked the fetch. This rewrite drops both libraries in favour of its own positioning code, adds a proxy fallback so cross-origin links preview, and makes the card restyleable without editing the source.

## What you get

- **One file, no dependencies.** A single `<script>` tag, or an `import`.
- **Silent failures.** No "Loading…" text and no error text. The card appears when it is ready, or not at all.
- **Cross-origin support.** Cross-origin links route through a pluggable reader proxy.
- **Title, description, thumbnail, favicon.** Each one can be switched on or off. Title and description are on by default; thumbnail and favicon are opt-in.
- **Restyleable.** The card inherits the page's font and colour, follows the system dark or light setting, and accepts CSS variables or a fully custom `render()` function.

## Where to go next

- [Getting started](getting-started.md): install the library and show a first preview.
- [Configuration](configuration.md): every option and its default.
- [Styling](styling.md): CSS variables, classes and custom markup.
- [Examples](examples.md): the live demo pages, simplest first.

!!! note
    `vexy-hrefc` is a reading aid, not load-bearing infrastructure. When a page will not cooperate, the preview stays out of the way.
