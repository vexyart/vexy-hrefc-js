# Development

How to build the library, run the tests, build this documentation site and release a new version.

## Prerequisites

- Node.js with `npm` (on some machines `npm` is a pnpm shim; the scripts use only commands both accept).
- For the documentation site: [`uv`](https://docs.astral.sh/uv/), which provides `uvx`.
- For releases: an npm account with publish rights to `vexy-hrefc`.

## Repository layout

| Path | Contents |
|---|---|
| `src/` | Library source, one ES module per concern, plus `hrefc.d.ts`. |
| `test/` | Tests for `node --test`. |
| `scripts/build.mjs` | The esbuild bundling script. |
| `dist/` | Build output. Not committed. |
| `src_docs/md/` | This documentation, plus the demo pages and their assets. |
| `src_docs/mkdocs.yml` | Documentation site configuration. |
| `docs/` | The generated site that GitHub Pages serves. Do not edit by hand. |

## Build the library

1. Install the development dependencies (`esbuild`, `linkedom`):

    ```bash
    npm install
    ```

2. Run the build:

    ```bash
    npm run build
    ```

`scripts/build.mjs` bundles `src/index.js` with esbuild, targeting ES2019, into:

- `dist/hrefc.esm.js`: ES module.
- `dist/hrefc.global.js`: IIFE that sets `window.Hrefc`.
- `dist/hrefc.global.min.js`: minified IIFE.
- `dist/hrefc.css`: the default stylesheet from `src/styles.js`, prefix `hrefc`.
- `dist/hrefc.d.ts`: copied from `src/hrefc.d.ts`.

It also copies `hrefc.global.min.js` and `hrefc.css` into `src_docs/md/assets/`, so the demo pages use the bundle you just built. It prints the size of each output file.

`./build.sh lib` runs `npm install` and `npm run build` in one step; `./build.sh` with no argument builds the library and then the documentation. `npm run clean` removes `dist/`.

## Run the tests

```bash
npm test
```

This runs `node --test`. The tests cover configuration merging, metadata extraction and the fetcher. Extraction tests use `linkedom` to provide a DOM in Node, so run `npm install` first.

## Build the documentation

ProperDocs builds the site from `src_docs/md/` into `docs/` using fly-january 0.4.0 or later (remote theme assets). The site configuration sets `extra.fly.chrome` to `none`.

1. Build once, in strict mode:

    ```bash
    ./build.sh docs
    ```

    or, equivalently, `src_docs/build.sh`.

2. Or preview with live reload on `http://127.0.0.1:8000`:

    ```bash
    src_docs/build.sh serve
    ```

The build replaces the contents of `docs/` and adds `docs/.nojekyll`. Files in `src_docs/md/demos/` and `src_docs/md/assets/` are copied to the site unchanged.

On every push to `main` that changes `src_docs/`, the `Docs` GitHub workflow runs `src_docs/build.sh` and commits the rebuilt `docs/` folder.

!!! tip
    Run `npm run build` before building the docs when the library has changed, so the demos pick up the new bundle in `src_docs/md/assets/`.

## Release to npm

`./publish.sh` performs the whole release:

1. Checks that you are logged in to npm (`npm whoami`) and offers `npm login` when run interactively.
2. Runs `npm install`, `npm test` and `npm run build`.
3. Runs `uvx gitnextver@latest`, which commits pending changes, tags the next `vX.Y.Z` and pushes.
4. Writes the new version into `package.json`, commits and pushes that change.
5. Runs `npm publish --access public`.

If `gitnextver` creates no new tag, the script publishes the version already in `package.json`.

## Code conventions

- No runtime dependencies.
- Each source file starts with a `this_file` comment that records its path.
- Failures are silent in the UI; errors are reported only through `onError`.
