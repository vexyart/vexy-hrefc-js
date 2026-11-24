---
this_file: TODO.md
---

# TODO — vexy-hrefc-js

- [ ] Schedule default metadata prefetch after `refresh()` with an idle callback and timer fallback.
- [ ] Cap `prefetchConcurrency` at four by default and reuse the cache and in-flight requests.
- [ ] Support lazy fetching with `prefetch: false`. Consider an optional visible-links mode.
- [ ] Test scheduling, concurrency, request sharing, and the lazy opt-out. Document prefetch and proxy rate limits.
- [ ] Cache full metadata by URL and apply title trimming, description limits, and thumbnail settings per link at render time.
- [ ] Add configurable classes, built-in `thumb` and `favicon` modifiers, and `data-hrefc-*` overrides in base → class → attribute order.
- [ ] Test per-link precedence and different previews from one fetch. Document and demo the overrides and the `selector: 'a[href]'` example.
- [ ] Meet the existing global bundle targets of under 12 KB minified and 5 KB gzipped. Verify with `npm run build`.
