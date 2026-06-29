# TODO — vexy-hrefc-js

Flat, actionable mirror of `PLAN.md`. Check items as they land.

## P1 — Foundation
- [x] Add `package.json` (name `vexy-hrefc`, exports/unpkg/jsdelivr/types, scripts, devDeps: esbuild, linkedom)
- [x] Add `.gitignore` entry for `dist/`
- [x] Create `src/` directory structure
- [x] Write `esbuild` build config (`scripts/build.mjs`) → ESM, global, min, css
- [x] Write `./build.sh` (install + `npm run build`, report sizes)
- [x] Confirm bundle builds

## P2 — Core library
- [x] `src/util.js` — `escapeHTML`, `absoluteUrl`, `originOf`, `isSameOrigin`, `withTimeout`
- [x] `src/config.js` — defaults + deep-merge + normalization
- [x] `src/extract.js` — title/description chains, body-text fallback, relative-URL resolution
- [x] `src/proxies.js` — `jina` (X-Engine/X-Return-Format), `allorigins`, `corsproxy`
- [x] `src/fetcher.js` — native + proxy chain, timeout, cache, in-flight dedupe
- [x] `src/styles.js` — default CSS, `--hrefc-*` vars, dark/light, font inheritance
- [x] `src/popup.js` — DOM build, positioning (flip/clamp), hover intent, show-only-when-ready, click-through
- [x] `src/index.js` — `hrefc()`, `Hrefc` class, `refresh`/`add`/`show`/`hide`/`destroy`, auto-init, exports
- [x] Manual QA: same-origin/proxy preview shows (headless DOM smoke test green)
- [x] Manual QA: cross-origin proxy path, silent on failure (smoke test green)

## P3 — Thumbnails & favicon
- [x] `src/thumbnail.js` — provider chain: ogimage → mshots → microlink → iframe → none
- [x] Click-protected iframe mode (desktop viewport, scaled down, overlay)
- [x] Favicon resolution (best size → /favicon.ico), opt-in, before title
- [x] Wire content toggles: title (on), description (on), thumbnail (off), favicon (off)

## P4 — Tests & verify
- [x] `test/extract.test.js` — og/twitter/title fallbacks, description chain, body-text cutoff, favicon
- [x] `test/config.test.js` — deep merge, class/selector overrides, no mutation
- [x] `test/fetcher.test.js` — cache hit, in-flight dedupe, proxy fallthrough, timeout abort, empty page
- [x] `npm test` green (19/19)
- [x] `npm run build` green; sizes recorded (global.min 14.8 KB / 5.5 KB gz)

## P5 — Docs & demos
- [x] `docs/_config.yml` — `remote_theme: just-the-docs`, nav, copy-code button
- [x] `docs/Gemfile` + `docs/index.md`
- [x] Demo harness: `docs/assets/demo.css` + `docs/assets/demo.js` (copy buttons)
- [x] `docs/demos/01-basic.html` + `docs/demos/index.html`
- [x] `docs/demos/02-description-favicon.html` … `06-proxies.html` 
- [x] `docs/getting-started.md`, `configuration.md`, `api-reference.md` 
- [x] `docs/styling.md`, `fetching-cors.md`, `thumbnails.md`, `recipes.md` 
- [x] Each `.md` embeds its demo via `<iframe>` + repeats copyable code
- [x] Build vendors bundle into `docs/assets/` for GitHub Pages

## P6 — Ship
- [x] `src/hrefc.d.ts` — typed public API (built into `dist/`)
- [x] `./publish.sh` — guards, build, `npm publish`, tag, push
- [x] `README.md` — strong lead, install, one example, links to docs 
- [x] `private/WEBFLOW.md` — exact swap steps for the `/lines` page 
- [x] `CHANGELOG.md` — 0.1.0 → 1.0.0 notes 
- [x] Final verify: build + test green (19/19), all 6 demos verified end-to-end, all iframe refs resolve

## Post-1.0 shipped
- [x] Published `vexy-hrefc` 1.0.0 → 1.0.2 to npm; clean `v1.0.2` tag
- [x] Tooltip polish (1.0.3): delicate fade-in, above-the-link default placement, speech-balloon arrow connector, configurable `content.cta`, styles injected at top of `<head>` so page CSS wins
- [ ] Finish publishing 1.0.3 to npm (blocked on interactive 2FA OTP — run `npm publish` in a terminal)

## P7 — Prefetch (issues/101 #1, see PLAN §9.1)
- [ ] `prefetch` config (default `true`) + `prefetchConcurrency` (default 4)
- [ ] Idle-scheduled prefetch of matched links after `refresh()` (`requestIdleCallback` → `setTimeout` fallback)
- [ ] Concurrency-capped queue; reuse cache + in-flight de-dupe
- [ ] `prefetch: false` (lazy) opt-out; optional `'visible'` mode via IntersectionObserver
- [ ] Docs: prefetch section + rate-limit guidance

## P8 — Per-link config (issues/101 #2, see PLAN §9.2)
- [ ] Refactor: split raw fetch+extract (cached by URL, full superset) from per-link render
- [ ] Apply `descriptionMaxLength` / `stripTitleSuffix` at render time, not extract time
- [ ] `modifiers` config (class → partial config); built-in `thumb`, `favicon`
- [ ] `data-hrefc-*` attribute overrides (thumbnail, favicon, cta, placement, title)
- [ ] Per-link config resolution (base → modifiers → data-attrs) with precedence rules
- [ ] "All links" preset (`selector: 'a[href]'`) documented
- [ ] Tests: per-link resolution; cache-by-URL with varying render configs
- [ ] Docs + demo: modifier classes and data-attributes
