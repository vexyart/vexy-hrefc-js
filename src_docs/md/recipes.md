# Recipes

Short answers to common setups. Each recipe is a problem and a code block.

## Add it to a Webflow site

No build step is needed.

1. In Webflow, open **Project Settings → Custom Code → Footer Code**.
2. Paste:

    ```html
    <script src="https://cdn.jsdelivr.net/npm/vexy-hrefc/dist/hrefc.global.min.js"></script>
    <script>
      Hrefc();
    </script>
    ```

3. In the Designer, give each link you want previewed the class `hrefc`.
4. Publish the site.

Hovering a link with the class `hrefc` now shows a card.

## Strip the site name from titles

Help and documentation pages often have titles like `"Refunds | Acme Help"`. Cut the suffix so the card reads `"Refunds"`:

```js
hrefc({ content: { stripTitleSuffix: true } });
```

## Preview footnotes and citations

Show where footnotes and citations point without scrolling to the bottom:

```js
hrefc({ selector: 'a.footnote-ref, sup a, cite a' });
```

## Click instead of hover

Better on touch screens, and for readers who do not want cards following the pointer:

```js
hrefc({ trigger: 'click' });
```

The click opens the preview instead of navigating. With `popup.interactive` on (the default), clicking the card follows the link.

## Open previews from your own code

Switch off automatic triggers and call `show()`:

```js
const inst = hrefc({ trigger: 'manual' });

document.querySelector('#preview-btn').addEventListener('click', () => {
  inst.show(document.querySelector('#target-link'));
});
```

## Show the hostname in a custom card

```js
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

hrefc({
  render: (data) => `
    <strong class="card-title">${esc(data.title)}</strong>
    <small class="card-url">${esc(new URL(data.url).hostname)}</small>
    <p>${esc(data.description)}</p>
  `,
});
```

The `esc` helper escapes the page's text before it goes into `innerHTML`.

## Pick up links added later

`hrefc()` scans once at start-up. After inserting links (a router view, infinite scroll, a comment thread), rescan:

```js
const inst = hrefc();

// after adding links to the DOM:
inst.refresh();
```

To rescan only part of the page, pass a root element: `inst.refresh(container)`.

## Log failures without showing them

The card never shows errors. To find out why a preview did not appear, use `onError`:

```js
hrefc({
  onError: (err, link) => console.warn('no preview for', link.href, err),
});
```

## Mount the card inside a dialog

If your links sit in a modal that traps stacking or focus, mount the card there:

```js
hrefc({ popup: { appendTo: () => document.querySelector('dialog[open]') } });
```

When the function returns nothing, the card is mounted in `document.body`.

## Avoid class-name collisions

If `hrefc-` clashes with existing CSS, change the prefix:

```js
hrefc({ popup: { classPrefix: 'lp' } });
```

The injected stylesheet follows the new prefix.
