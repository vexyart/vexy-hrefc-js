# Examples

Live demo pages, simplest first. Each page shows a working preview, the code that produced it, and a **Copy** button for that code. The demos load the bundle from `assets/hrefc.global.min.js` on this site.

Open the [demo index](demos/index.html) to browse them, or jump straight to one:

| Demo | What it shows |
|---|---|
| [01 – The one-liner](demos/01-basic.html) | A link, a class and one function call. |
| [02 – Content toggles](demos/02-description-favicon.html) | Title, description and favicon. |
| [03 – Thumbnails](demos/03-thumbnails.html) | `og:image`, screenshots and the iframe fallback. |
| [04 – Styling](demos/04-styling.html) | CSS variables, dark mode and a full reskin. |
| [05 – Custom render](demos/05-custom-render.html) | Your own card markup through `render()`. |
| [06 – Proxies and CORS](demos/06-proxies.html) | A custom fetch chain. |

## 01 – The one-liner

<iframe src="../demos/01-basic.html" style="width:100%;height:420px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Basic demo"></iframe>

## 05 – Custom render

<iframe src="../demos/05-custom-render.html" style="width:100%;height:460px;border:1px solid #e4e4e8;border-radius:10px;margin:12px 0;" title="Custom render demo"></iframe>

The other demos are embedded on the pages that explain them: [Configuration](configuration.md#content), [Thumbnails](thumbnails.md), [Styling](styling.md) and [Fetching and CORS](fetching-cors.md).

!!! note
    The previews in these demos fetch live pages through public proxies. If a proxy is slow or rate-limited, a preview may not appear; that is the silent-failure behaviour working as designed.
