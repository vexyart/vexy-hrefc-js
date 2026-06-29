# vexy-hrefc

Hover a link, see what's behind it. No click, no new tab, no leaving the page.

`vexy-hrefc` is a client-side link-preview popup in one file, with no dependencies. Point at a link and a small card fades in with the target page's title and a line about it. It reads Open Graph tags first, falls back through plainer HTML, and when the browser blocks the request — which it often does — it routes through a reader proxy instead.

The first version lived inside a Webflow page and leaned on Tippy.js and Popper from a CDN. It worked, until a link pointed somewhere else and CORS killed the fetch. This is the zero-dependency rewrite: the two libraries are gone, cross-origin links preview through a proxy fallback, and every failure is silent — a broken preview shows nothing, never an error.

## Quick start

Drop in one script tag, add a class to the links you want previewed, and call `Hrefc()`:

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>

<a class="hrefc" href="https://en.wikipedia.org/wiki/Hyperlink">hyperlink</a>

<script>
  Hrefc();
</script>
```

That's a working preview. Or install it and `import`:

```bash
npm install vexy-hrefc
```

```js
import { hrefc } from 'vexy-hrefc';

hrefc();
```

Links opt in with `class="hrefc"` or `data-hrefc`, so you don't accidentally preview every link on the page.

## Features

- **One file, no dependencies.** A single `<script>` tag, or `import` it. ~14.8 KB minified, ~5.5 KB gzipped.
- **Silent failures.** No "Loading…", no error text. The card fades in above the link — centered over it, with a speech-balloon connector pointing down — when it's ready, or not at all.
- **CORS handled.** Cross-origin links route through a pluggable reader proxy (`r.jina.ai` by default).
- **Title, description, thumbnail, favicon.** Each one toggleable. Title and description are on; the rest opt in. Add an optional "Click to read more" footer when you want one.
- **Yours to restyle.** Inherits the page's fonts and colors, follows the system dark/light setting, and bends to CSS variables or a full custom `render()`.

## Configuring it

Pass an options object. A few of the common ones:

```js
hrefc({
  selector: 'a.preview',           // which links get previews
  content: {
    thumbnail: true,               // show a thumbnail
    favicon: true,                 // show the site's favicon
    cta: 'Click to read more',     // optional footer nudging the click
    stripTitleSuffix: true,        // trim "Page | Site" → "Page"
  },
  popup: {
    theme: 'dark',                 // 'auto' | 'light' | 'dark'
    maxWidth: 420,
  },
});
```

Every option, with defaults and examples, lives in the [configuration docs](https://vexyart.github.io/vexy-hrefc-js/configuration/).

## Build & test

```bash
./build.sh        # install dependencies, then build dist/
npm run build     # build dist/ only
npm test          # run the test suite (node --test)
```

On some machines `npm` is a pnpm shim; the scripts use only commands both accept, so either works.

## Links

- **Docs:** <https://vexyart.github.io/vexy-hrefc-js/>
- **Demos:** <https://vexyart.github.io/vexy-hrefc-js/demos/>
- **GitHub:** <https://github.com/vexyart/vexy-hrefc-js>
- **npm:** <https://www.npmjs.com/package/vexy-hrefc>

## License

Apache-2.0 © Adam Twardoch
