---
title: Home
layout: default
nav_order: 1
---

<!-- this_file: docs/index.md -->

# Hover a link, see what's behind it

No click. No new tab. No leaving the page. Point at a link, and a small card fades in above it — centered, with a connector arrow — carrying the target's title and a line about it. Move away, and it's gone.

`vexy-hrefc` is a client-side link previewer in one file, with no dependencies. It reads Open Graph tags first, falls back through plainer HTML, and when the browser blocks the request — which it often does — it routes through a reader proxy instead. It fails silently by design: a broken preview shows nothing, never an error.

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<a class="hrefc" href="https://en.wikipedia.org/wiki/Hyperlink">hyperlink</a>
<script>
  Hrefc();
</script>
```

That's a working preview. See it run in the [basic demo]({{ '/demos/01-basic.html' | relative_url }}).

<iframe src="{{ '/demos/01-basic.html' | relative_url }}" style="width:100%;height:420px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Basic demo"></iframe>

## Why it exists

The first version lived inside a Webflow page, leaning on Tippy.js and Popper loaded from a CDN. It worked, mostly, until a link pointed somewhere else and CORS killed the fetch. This rewrite drops both dependencies for ~60 lines of positioning code, adds a proxy fallback so cross-origin links actually preview, and makes the whole thing restyleable without touching the source.

## What you get

- **One file, no dependencies.** A single `<script>` tag, or `import` it.
- **Silent failures.** No "Loading…", no error text. It shows up when it's ready, or not at all.
- **CORS handled.** Cross-origin links route through a pluggable reader proxy.
- **Title, description, thumbnail, favicon.** Each one toggleable. Title and description are on; the rest opt in.
- **Yours to restyle.** Inherits the page's fonts and colors, follows the system dark/light setting, and bends to CSS variables or a full custom render.

## Next

- [Getting started]({{ '/getting-started/' | relative_url }}) — install and first preview.
- [Configuration]({{ '/configuration/' | relative_url }}) — every option.
- [Styling]({{ '/styling/' | relative_url }}) — make it yours.
- [Demos]({{ '/demos/' | relative_url }}) — running examples, simplest first.

{: .note }
This is a reading-experience enhancement, not load-bearing infrastructure. It's built to disappear quietly when a page won't cooperate.
