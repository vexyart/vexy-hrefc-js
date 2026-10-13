# Styling

The card ships with a default look that inherits your page's font and colour. To change it, you have three levels, each with more reach than the last: set CSS variables, write CSS against the class names, or replace the markup with `render()`.

## Structure

The default card is built from these elements:

```text
div.hrefc-popup          positioning, fade, theme variables
├── div.hrefc-arrow      connector arrow (when popup.arrow is true)
└── div.hrefc-card       the visible box
    ├── img.hrefc-thumb  or div.hrefc-thumb-frame (when content.thumbnail is true)
    ├── div.hrefc-head
    │   ├── img.hrefc-favicon (when content.favicon is true)
    │   └── span.hrefc-title
    ├── p.hrefc-desc
    └── div.hrefc-cta    (when content.cta is set)
```

`.hrefc-popup` holds the `--hrefc-*` variables. Both the card and the arrow read them, so the arrow follows the card's `--hrefc-bg` and `--hrefc-border` automatically. Remove the arrow with `popup: { arrow: false }`.

The popup also carries state attributes you can target:

| Attribute | Values | Meaning |
|---|---|---|
| `data-show` | `"1"` or absent | Present while the card is visible. |
| `data-placement` | `"top"`, `"bottom"` | Which side of the link the card is on. |
| `data-theme` | `"light"`, `"dark"` or absent | Set when `popup.theme` is not `'auto'`. |

!!! note
    The default stylesheet is inserted as the first child of `<head>`. Any CSS your page loads later wins without `!important`.

## Level 1: CSS variables

For a quick reskin, override the variables on `.hrefc-popup`.

| Variable | Default (light) | Controls |
|---|---|---|
| `--hrefc-fg` | `#1a1a1a` | Text colour |
| `--hrefc-bg` | `#fff` | Card and arrow background |
| `--hrefc-border` | `rgba(0,0,0,.12)` | Border colour |
| `--hrefc-radius` | `12px` | Corner radius |
| `--hrefc-shadow` | `0 8px 30px rgba(0,0,0,.16)` | Drop shadow |
| `--hrefc-desc` | `rgba(0,0,0,.66)` | Description colour |
| `--hrefc-thumb-bg` | `rgba(0,0,0,.04)` | Thumbnail placeholder background |
| `--hrefc-pad` | `12px 14px` (fallback) | Inner padding |
| `--hrefc-size` | `14px` (fallback) | Base font size |
| `--hrefc-title` | `inherit` (fallback) | Title colour |
| `--hrefc-cta` | `inherit` (fallback) | Call-to-action colour |

The last four are not set by the stylesheet; it reads them with the fallback shown. Set them to change the value.

A warmer, rounder card:

```css
.hrefc-popup {
  --hrefc-bg: #fffdf7;
  --hrefc-radius: 18px;
  --hrefc-shadow: 0 10px 40px rgba(120, 80, 0, 0.18);
  --hrefc-desc: #6b5b3e;
}
```

## Level 2: classes

For anything the variables do not cover, write CSS against the classes. To change a box property such as padding or width directly, target `.hrefc-card`, the visible box. `.hrefc-popup` only positions and fades.

| Class | Part |
|---|---|
| `.hrefc-popup` | Positioning and fade wrapper |
| `.hrefc-card` | Visible box |
| `.hrefc-arrow` | Connector arrow |
| `.hrefc-head` | Favicon and title row |
| `.hrefc-favicon` | Favicon image |
| `.hrefc-title` | Title |
| `.hrefc-desc` | Description |
| `.hrefc-cta` | Call-to-action footer |
| `.hrefc-thumb` | Thumbnail image |
| `.hrefc-thumb-wide`, `.hrefc-thumb-half`, `.hrefc-thumb-float` | Thumbnail layout by aspect ratio (see [Thumbnails](thumbnails.md#layout-by-shape)) |
| `.hrefc-thumb-frame` | Wrapper for the iframe fallback |

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

### Style the call-to-action

Set `content.cta` and it renders as `.hrefc-cta` below the description:

```css
.hrefc-cta {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #2563eb;
}
```

!!! tip
    To ship your own stylesheet instead of the injected one, set `popup: { injectStyles: false }`, then start from the standalone file: `import 'vexy-hrefc/css'`, or copy `dist/hrefc.css`. The standalone file is built with the default prefix `hrefc`.

## Level 3: render()

When the structure itself must change, pass a `render` function. Its result replaces the default contents of `.hrefc-card`. The popup wrapper, the arrow and positioning still apply.

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

!!! warning
    A returned string is set as `innerHTML`. Escape anything you do not control. There is a worked example in [demo 05](demos/05-custom-render.html).

## Dark mode

By default the card follows the system setting through `@media (prefers-color-scheme: dark)`. No configuration is needed.

To pin a palette, set `popup.theme`. It writes a `data-theme` attribute on `.hrefc-popup`:

```js
hrefc({ popup: { theme: 'dark' } });   // always dark
hrefc({ popup: { theme: 'light' } });  // always light
hrefc({ popup: { theme: 'auto' } });   // follow the system (default)
```

To use your own dark palette, override the variables under the attribute:

```css
.hrefc-popup[data-theme="dark"] {
  --hrefc-bg: #0d1117;
  --hrefc-fg: #e6edf3;
}
```

Users who set "reduce motion" in their system get a plain opacity fade without the upward slide.

## Font inheritance

With `popup.inheritFont: true` (the default), the card uses `font-family: inherit`, so it reads as part of your page. Set it to `false` to use the system UI stack `system-ui, -apple-system, Segoe UI, Roboto, sans-serif` instead.

## Rename classes

Change the prefix of every class with `popup.classPrefix`. The injected stylesheet uses the same prefix:

```js
hrefc({ popup: { classPrefix: 'lp' } });
// .lp-popup, .lp-card, .lp-title, .lp-desc, …
```

Or rename single parts with the `classes` map. The default stylesheet does not follow these names, so style them yourself:

```js
hrefc({ classes: { title: 'card__title', desc: 'card__body' } });
```

<iframe src="../demos/04-styling.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Styling demo"></iframe>
