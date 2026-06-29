# Changelog

All notable changes to `vexy-hrefc` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-06-29

### Changed

- **Card centered over the link.** The preview now sits horizontally centered
  on the link it previews, clamped to stay within the viewport.

## [1.0.4] - 2026-06-29

### Added

- **Speech-balloon arrow connector.** A small arrow points from the card down to
  the link. On by default; turn it off with `popup.arrow: false`.
- **Call-to-action footer.** An optional `content.cta` string or HTML — e.g.
  `"Click to read more"` — renders below the description, styled via the
  `.hrefc-cta` class. Off by default.

### Changed

- **Placement above the link.** The card now appears above the link by default,
  not below. `popup.placement` accepts `'auto'` (default, prefers above),
  `'top'`, or `'bottom'`.
- **Smoother fade-in** when the card appears.
- **Styles inject at the top of `<head>`**, so page CSS overrides them without
  needing `!important`.

## [1.0.0] - 2026-06-29

The production rewrite. The in-page prototype becomes a real library: one file,
no dependencies, restyleable, and published to NPM.

### Added

- **Zero-dependency popup and positioner.** Tippy.js and Popper are gone,
  replaced by ~60 lines of positioning code. Nothing loads from a CDN but the
  library itself.
- **ESM and global builds.** `import { hrefc } from 'vexy-hrefc'`, or a single
  `<script>` tag exposing `window.Hrefc`.
- **CORS proxy fallback chain.** Cross-origin links route through a reader proxy
  (`r.jina.ai` by default). The chain is ordered and pluggable — add your own
  adapters or reorder them.
- **Silent failures.** No loading state, no error text. The card appears when
  content is ready, or not at all.
- **Title, description, thumbnail, and favicon**, each with a per-field toggle.
  Title and description are on by default; thumbnail and favicon opt in.
- **Full theming.** CSS custom properties, automatic dark/light following the
  system setting, font and color inheritance, and a `render(data, link)` hook
  for total control of the card.
- **Caching and in-flight de-duplication.** Results are cached; two hovers on
  the same link fire one request.
- **NPM package and tooling.** `build.sh` and `publish.sh`, hand-written
  TypeScript definitions, and a documentation site with live demos.

## [0.1.0]

The original in-page prototype, embedded in the Webflow `/lines` page. A
Tippy.js tooltip that extracted `og:title` and `og:description` with native
`fetch`, trimmed the title at the first `|`, and fell back to a hardcoded mock
table when a request failed. The starting point this release replaces.
