---
title: Styling
layout: default
nav_order: 4
permalink: /styling/
---

<!-- this_file: docs/styling.md -->

# Styling

The card ships looking fine and inheriting your page. When you want it to look like *yours*, there are three levels, each with more reach than the last: change a few CSS variables, target the classes directly, or take over the markup entirely.

## Structure

The popup is a wrapper around a visual card. `.hrefc-popup` handles positioning and the fade; inside it, `.hrefc-card` is the box you see and `.hrefc-arrow` is the speech-balloon connector pointing at the link. The `--hrefc-*` variables live on `.hrefc-popup`, and both the card and the arrow inherit them — so the arrow tracks the card's `--hrefc-bg` and `--hrefc-border` automatically. Turn it off with `popup: { arrow: false }`.

{: .note }
Styles inject at the top of `<head>`, so any CSS you load later wins without `!important`.

## Level 1: CSS variables

For a quick reskin, override the `--hrefc-*` variables. No JavaScript, no fighting specificity — just set them on `.hrefc-popup` (or anywhere it inherits from).

| Variable | Default | Controls |
|---|---|---|
| `--hrefc-fg` | `#1a1a1a` | Text color |
| `--hrefc-bg` | `#fff` | Card background |
| `--hrefc-border` | `rgba(0,0,0,.12)` | Border color |
| `--hrefc-radius` | `12px` | Corner radius |
| `--hrefc-shadow` | `0 8px 30px rgba(0,0,0,.16)` | Drop shadow |
| `--hrefc-pad` | `12px 14px` | Inner padding |
| `--hrefc-size` | `14px` | Base font size |
| `--hrefc-title` | `inherit` | Title color |
| `--hrefc-desc` | `rgba(0,0,0,.66)` | Description color |
| `--hrefc-cta` | `inherit` | Call-to-action color |
| `--hrefc-thumb-bg` | `rgba(0,0,0,.04)` | Thumbnail placeholder background |

A warmer, rounder card in five lines:

```css
.hrefc-popup {
  --hrefc-bg: #fffdf7;
  --hrefc-radius: 18px;
  --hrefc-shadow: 0 10px 40px rgba(120, 80, 0, 0.18);
  --hrefc-desc: #6b5b3e;
}
```

## Level 2: target the classes

Variables don't cover everything — spacing between parts, the favicon size, a title underline. For that, write plain CSS against the class names. To override a box-level property directly rather than through a variable, target `.hrefc-card`, the visual box — not `.hrefc-popup`, which now only positions and fades.

| Class | Part |
|---|---|
| `.hrefc-popup` | Positioning + fade wrapper |
| `.hrefc-card` | Visual box — target for direct property overrides |
| `.hrefc-arrow` | Speech-balloon connector |
| `.hrefc-head` | Favicon + title row |
| `.hrefc-favicon` | Favicon image |
| `.hrefc-title` | Title |
| `.hrefc-desc` | Description |
| `.hrefc-cta` | Call-to-action footer |
| `.hrefc-thumb` | Thumbnail image |
| `.hrefc-thumb-frame` | Iframe-fallback wrapper |

```css
.hrefc-title {
  letter-spacing: -0.01em;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.hrefc-favicon {
  border-radius: 50%;
}
```

### Styling the call-to-action

Set `content.cta` (say, `"Click to read more"`) and it renders as `.hrefc-cta` below the description. Style it with the `--hrefc-cta` variable or directly:

```css
.hrefc-cta {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #2563eb;
}
```

{: .tip }
The default styles auto-inject. To ship your own sheet instead, set `popup: { injectStyles: false }` and import the standalone stylesheet with `import 'vexy-hrefc/css'`, then edit from there.

## Level 3: render() — total ownership

When the structure itself needs to change, hand `hrefc` a `render` function. Return an `HTMLElement` or an HTML string, and your markup replaces the default card wholesale — variables and classes no longer apply unless you reuse them.

```js
hrefc({
  render: (data) => `
    <article class="my-card">
      <h4>${data.title}</h4>
      <p>${data.description}</p>
    </article>
  `,
});
```

{: .warning }
A returned string is set as `innerHTML`. Escape anything you don't control. The full `PreviewData` shape lives in the [API reference]({{ '/api-reference/' | relative_url }}), and there's a worked example in [demo 05]({{ '/demos/05-custom-render.html' | relative_url }}).

## Dark mode

Out of the box the card follows the system setting via `@media (prefers-color-scheme: dark)` — light room, light card; dark room, dark card. Nothing to wire up.

To override that, set `popup.theme`. It writes a `data-theme` attribute on the card and pins the palette:

```js
hrefc({ popup: { theme: 'dark' } });   // always dark
hrefc({ popup: { theme: 'light' } });  // always light
hrefc({ popup: { theme: 'auto' } });   // follow the system (default)
```

If you want your own dark palette rather than the built-in one, override the variables under the attribute:

```css
.hrefc-popup[data-theme="dark"] {
  --hrefc-bg: #0d1117;
  --hrefc-fg: #e6edf3;
}
```

## Font and color inheritance

By default the card inherits the host page's font (`inheritFont: true`), so it reads as part of your site, not a widget bolted on. Set `popup: { inheritFont: false }` to fall back to a neutral system-UI stack instead — useful when the surrounding font is decorative and you'd rather the card stayed legible.

Text color works the same way: `--hrefc-title` defaults to `inherit`, picking up your page's color until you say otherwise.

## Renaming classes

Two reasons to rename: the `hrefc-` prefix collides with something, or your design system expects its own names.

Change the prefix for every class at once with `popup.classPrefix`:

```js
hrefc({ popup: { classPrefix: 'lp' } });
// → .lp-popup, .lp-title, .lp-desc, …
```

Or rename individual parts with the `classes` map, leaving the rest as generated:

```js
hrefc({ classes: { root: 'card', title: 'card__title', desc: 'card__body' } });
```

<iframe src="{{ '/demos/04-styling.html' | relative_url }}" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Styling demo"></iframe>

## Next

- [Configuration]({{ '/configuration/' | relative_url }}) — every option in one place.
- [Thumbnails]({{ '/thumbnails/' | relative_url }}) — images, screenshots, and the iframe fallback.
- [API reference]({{ '/api-reference/' | relative_url }}) — the `PreviewData` contract for `render`.
