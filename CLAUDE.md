# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`vexy-hrefc-js` ("href see" — see the content of href links) is a client-side JS link previewer. Hover a link, fetch the target page, extract its title/description, and show a small preview tooltip. It ships as both an ESM module and a global (browser `<script>`) library, published to NPM and used on vexy.art websites (e.g. https://vexy-art.webflow.io/lines).

**Status: pre-implementation.** The repo currently holds only an idea spec and a working prototype. There is no `package.json`, build system, or `src/` yet. Most of the structure described below is *intended*, not present — check before assuming a file exists.

## Where things are

- `private/IDEA.md` — the authoritative project brief. Read this first. Defines goals, requirements, and writing rules.
- `private/vexy-hrefc-js-v0.1.html` — the v0.1 prototype. The library to build lives in the **"Fetch Help local code"** `<script>` block (the section between the `START/END Fetch Help` comments). Everything else in that file (hover-video player, download modal, Freshdesk/MailChimp/FastSpring snippets) is unrelated host-page noise — ignore it.
- `private/` is gitignored. Don't expect its contents to be committed.

## The prototype's core logic (what to productionize)

The "Fetch Help local code" block, using [Tippy.js](https://atomiks.github.io/tippyjs/) + Popper for the tooltip UI:

1. On `onShow`, fetch the link's `href`, parse the HTML with `DOMParser`.
2. Extract `og:title` (trimmed at the first `|`) → fall back to `<title>`; extract `og:description`.
3. Render an escaped HTML tooltip; cache results in a `Map`; dedupe in-flight requests via a `pending` `Map`.
4. On fetch failure, fall back to a hardcoded `fallbackMocks` lookup.

When evolving this into the library, honor these requirements from `IDEA.md`:

- **CORS fallback chain.** Native `fetch` fails cross-origin in production. Fall back to a reader proxy — `curl "https://r.jina.ai/<url>" -H "X-Engine: direct" -H "X-Return-Format: html"` — and make additional fallback services pluggable.
- **Silent by design.** Don't show "Loading…". The popup must not appear until the preview is ready, and render failures must fail silently. This is an enhancement, not a critical feature.
- **Fully customizable.** Reacted-to class names, styling, and behavior all configurable via a config object. Defaults should inherit the host page's fonts/colors and respect system dark/light mode, while remaining fully restyleable.
- **Client-side only.** No server component.

## Intended deliverables (per IDEA.md — not yet created)

- `PLAN.md` — detailed productionization plan.
- `build.sh` / `publish.sh` — build and NPM publish scripts. Build must emit both ESM and a global/UMD bundle.
- `docs/` — extensive docs using the remote **Just the Docs** Jekyll theme, hosted on GitHub Pages.
- `private/WEBFLOW.md` — instructions for replacing the prototype code on the Webflow site (editable via Webflow MCP; page id `6a3a85f11a8adeae9338a9f9`).
- Target repo: https://github.com/vexyart/vexy-hrefc-js

## Writing rules (for any prose: docs, README, comments, errors)

From `IDEA.md`, follow exactly. Lead strong — first line earns attention, no throat-clearing. Plain language, no jargon/passive voice/corporate fluff. Concise; every sentence counts. Show, don't tell. Error messages are UX — make them helpful. Edit ruthlessly. Cut hype words ("revolutionary"). Light understated humor (Norm Macdonald × Stephen Fry) is allowed but clarity wins; broadly follow Stephen King's advice.
