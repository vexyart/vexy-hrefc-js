---
title: Getting started
layout: default
nav_order: 2
permalink: /getting-started/
---

<!-- this_file: docs/getting-started.md -->

# Getting started

Two lines of HTML and one function call. That's the whole install.

## Install

Pick the way that matches how you build.

**Script tag (global).** Drop it in, no build step. `Hrefc` lands on `window`.

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
```

**npm (ESM).** For bundlers and frameworks.

```bash
npm i vexy-hrefc
```

```js
import { hrefc } from 'vexy-hrefc';
```

## The one-liner

Mark the links you want previewed with `class="hrefc"`, then call `Hrefc()`. Done.

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>

<a class="hrefc" href="https://en.wikipedia.org/wiki/Hyperlink">hyperlink</a>

<script>
  Hrefc();
</script>
```

Hover the link. A card fades in with the page's title and a line about it. Move away, it's gone.

<iframe src="{{ '/demos/01-basic.html' | relative_url }}" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Basic preview demo"></iframe>

## ESM usage

Same idea through an import. `hrefc(config)` returns a running instance.

```js
import { hrefc } from 'vexy-hrefc';

const inst = hrefc({ selector: 'a.preview' });
```

Styles inject themselves by default. If you'd rather ship the stylesheet yourself — or you've turned `injectStyles` off — import it once:

```js
import 'vexy-hrefc/css';
```

## Why it doesn't preview every link

By default the selector is `[data-hrefc], a.hrefc`. A link only previews if it has `class="hrefc"` or a `data-hrefc` attribute. This is on purpose: nobody wants a card popping up on every footer link, anchor, and "click here".

To widen the net, pass your own selector. Preview every external link inside `<main>`, say:

```js
hrefc({ selector: 'main a[href^="http"]' });
```

{: .tip }
The selector is a plain CSS selector. If `querySelectorAll` accepts it, so does `hrefc`.

## Links you add later

`hrefc()` scans the DOM once, on start. Inject links after that — a loaded comment thread, a router view, a search result — and they won't be wired up yet. Call `refresh()` to pick up the new ones.

```js
const inst = hrefc();

// ...later, after adding links to the page:
inst.refresh();
```

For a single known element, `inst.add(el)` skips the rescan. See the full instance API in the [API reference]({{ '/api-reference/' | relative_url }}).

{: .note }
Previews fail silently. If a page blocks the request and every proxy strikes out, nothing appears — no spinner, no error. And styles auto-inject, so the card looks right with zero CSS from you.
