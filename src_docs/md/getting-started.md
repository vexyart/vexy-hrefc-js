# Getting started

This page shows how to load `vexy-hrefc`, mark the links you want previewed, and start it.

## Prerequisites

- A web page you can edit.
- For the npm route: Node.js and a bundler or framework that understands ES modules.

## Install

Choose the method that matches how you build the page.

=== "Script tag"

    No build step. The script defines a global `Hrefc` on `window`.

    ```html
    <script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
    ```

    The same file is also on unpkg: `https://unpkg.com/vexy-hrefc/dist/hrefc.global.min.js`.

=== "npm"

    ```bash
    npm install vexy-hrefc
    ```

    ```js
    import { hrefc } from 'vexy-hrefc';
    ```

The npm package contains these files in `dist/`:

| File | Format |
|---|---|
| `hrefc.esm.js` | ES module (the package entry point) |
| `hrefc.global.js` | Readable IIFE that sets `window.Hrefc` |
| `hrefc.global.min.js` | Minified IIFE that sets `window.Hrefc` |
| `hrefc.css` | The default stylesheet, standalone |
| `hrefc.d.ts` | TypeScript type definitions |

## Show your first preview

1. Load the script as shown above.
2. Add `class="hrefc"` to a link:

    ```html
    <a class="hrefc" href="https://en.wikipedia.org/wiki/Hyperlink">hyperlink</a>
    ```

3. Start the library after the script has loaded:

    ```html
    <script>
      Hrefc();
    </script>
    ```

4. Hover the link.

A card fades in above the link, centred over it, with a small arrow pointing down at the link. It shows the page title and a description. Move the pointer away and the card fades out.

<iframe src="../demos/01-basic.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Basic preview demo"></iframe>

## Use it from an ES module

`hrefc(config)` creates and returns a running instance:

```js
import { hrefc } from 'vexy-hrefc';

const inst = hrefc({ selector: 'a.preview' });
```

The stylesheet is injected automatically. To ship it yourself, for example after setting `popup.injectStyles` to `false`, import the standalone file once:

```js
import 'vexy-hrefc/css';
```

## Configure from a script tag without arguments

If you cannot pass arguments, set `window.HrefcConfig` before the library starts and call `Hrefc.auto()`:

```html
<script>
  window.HrefcConfig = { content: { thumbnail: true } };
</script>
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<script>
  Hrefc.auto();
</script>
```

`auto()` reads `window.HrefcConfig` and falls back to the defaults when it is not set.

## Why not every link previews

The default selector is `[data-hrefc], a.hrefc`. A link previews only if it has `class="hrefc"` or a `data-hrefc` attribute. This keeps cards from appearing on navigation links, footer links and in-page anchors.

To preview more links, pass your own selector. For example, every absolute `http` or `https` link inside `<main>`:

```js
hrefc({ selector: 'main a[href^="http"]' });
```

!!! tip
    The selector is passed to `querySelectorAll`. Any selector that `querySelectorAll` accepts works.

## Links added after start-up

`hrefc()` scans the document once, when it starts. Links inserted later (a loaded comment thread, a router view, search results) are not wired up until you call `refresh()`:

```js
const inst = hrefc();

// later, after inserting links into the page:
inst.refresh();
```

For a single known element, `inst.add(el)` attaches without rescanning. Links that are already attached are skipped, so calling `refresh()` twice does not add duplicate listeners. See the [API reference](api-reference.md) for every instance method.

!!! note
    If a page blocks the request and every proxy fails, nothing appears: no spinner and no error message. To see why a preview failed, use the `onError` hook described in [Configuration](configuration.md#hooks).
