---
title: Recipes
layout: default
nav_order: 8
permalink: /recipes/
---

<!-- this_file: docs/recipes.md -->

# Recipes

Short, copy-paste answers to common setups. Each one is a problem and a block — grab what you need.

## Webflow embed

Drop `hrefc` into a Webflow site without a build step.

Add the script in **Project Settings → Custom Code → Footer**, then initialize it. Give the links you want previewed the class `hrefc`.

```html
<script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
<script>
  Hrefc();
</script>
```

{: .note }
Migrating from the old Tippy/Popper setup? The repo's `WEBFLOW.md` handoff walks through the full swap, class for class. See it on [GitHub](https://github.com/vexyart/vexy-hrefc-js).

## Strip the site name from titles

Help and docs pages often title themselves `"Refunds | Acme Help"`. Trim the suffix so the card reads `"Refunds"`.

```js
hrefc({ content: { stripTitleSuffix: true } });
```

## Footnote and citation previews

Preview where footnotes and citations point, without scrolling to the bottom.

```js
hrefc({ selector: 'a.footnote-ref, sup a, cite a' });
```

## Click to preview instead of hover

Better for touch screens, and for readers who don't want cards chasing the cursor.

```js
hrefc({ trigger: 'click' });
```

## Drive previews yourself

Turn off automatic triggers and open the card from your own code.

```js
const inst = hrefc({ trigger: 'manual' });

document.querySelector('#preview-btn').addEventListener('click', () => {
  inst.show(document.querySelector('#target-link'));
});
```

## A custom card

Replace the default markup with your own.

```js
hrefc({
  render: (data) => `
    <strong class="card-title">${data.title}</strong>
    <small class="card-url">${new URL(data.url).hostname}</small>
    <p>${data.description}</p>
  `,
});
```

{: .warning }
A returned string becomes `innerHTML` — escape anything you don't control. Full data shape in the [API reference]({{ '/api-reference/' | relative_url }}).

## Re-scan after content loads

`hrefc` scans once on start. After you inject links — a router view, infinite scroll, a loaded comment thread — pick up the new ones.

```js
const inst = hrefc();

// ...after adding links to the DOM:
inst.refresh();
```

For a single known element, `inst.add(el)` skips the rescan.

## Log failures without showing them

The UI stays silent on failure by design. To see *why* a preview didn't appear, hook `onError` — it fires, the card still doesn't.

```js
hrefc({
  onError: (err, link) => console.warn('no preview for', link.href, err),
});
```

## Next

- [Configuration]({{ '/configuration/' | relative_url }}) — every option these recipes pull from.
- [API reference]({{ '/api-reference/' | relative_url }}) — `refresh`, `add`, `show`, and the rest.
- [Demos]({{ '/demos/' | relative_url }}) — running examples.
