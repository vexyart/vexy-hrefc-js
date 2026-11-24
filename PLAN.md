---
this_file: PLAN.md
---

# PLAN — vexy-hrefc-js

Hover a link, see what's behind it. The remaining requests came from [issues/101.md](issues/101.md).

## Prefetch metadata

Today the first preview waits on the network. After `refresh()` attaches links, schedule metadata prefetch at idle with `requestIdleCallback` and a `setTimeout` fallback. On long pages, cap concurrency at four by default (`prefetchConcurrency`) and reuse the URL cache and in-flight deduplication.

Enable prefetch by default. `prefetch: false` fetches on hover. Keep screenshots and iframes on demand. Consider `prefetch: 'visible'` as an optional mode for long pages.

Verify that prefetch starts after initialization, respects the concurrency cap, shares requests with hover, and makes zero eager requests when disabled. Document the opt-out and proxy rate limits.

## Per-link previews

One init, several behaviors. Keep extracted metadata in one cache entry per URL. Apply title suffix trimming, description length, content toggles and thumbnail provider choice when rendering each link.

Merge the base config, matching classes from `modifiers`, then `data-hrefc-*` overrides when `dataAttributes` is enabled. Ship `thumb` and `favicon` class defaults. Boolean attributes support presence and `"false"`. CTA and placement take string values.

Verify precedence and check that two links to the same URL can show different fields and text lengths after one fetch. Document and demo the class and attribute overrides. Show `hrefc({ selector: 'a[href]' })` for all links with a destination.

## Bundle size

Keep the existing target of under 12 KB minified and 5 KB gzipped. The checked-in demo bundle measures 16,772 bytes minified and 6,116 bytes gzipped. Run `npm run build` and check the size of the generated global bundle before closing this item.
