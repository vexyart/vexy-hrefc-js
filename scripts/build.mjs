//! this_file: scripts/build.mjs
// Bundle src/index.js into ESM, a readable global, and a minified global.
// Also emit a standalone hrefc.css. No config file, no ceremony.
import { build } from 'esbuild';
import { rmSync, mkdirSync, writeFileSync, statSync, cpSync } from 'node:fs';
import { defaultCss } from '../src/styles.js';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const common = {
  entryPoints: ['src/index.js'],
  bundle: true,
  target: ['es2019'],
  logLevel: 'warning',
};

// Attach the default export to window.Hrefc and copy named exports onto it,
// so both `Hrefc(config)` and `Hrefc.auto()` work from a <script> tag.
const globalFooter = {
  js: 'if(typeof window!=="undefined"){var _h=Hrefc;window.Hrefc=_h.hrefc||_h.default;Object.assign(window.Hrefc,_h);}',
};

await build({ ...common, format: 'esm', outfile: 'dist/hrefc.esm.js' });
await build({
  ...common,
  format: 'iife',
  globalName: 'Hrefc',
  footer: globalFooter,
  outfile: 'dist/hrefc.global.js',
});
await build({
  ...common,
  format: 'iife',
  globalName: 'Hrefc',
  footer: globalFooter,
  minify: true,
  outfile: 'dist/hrefc.global.min.js',
});

writeFileSync('dist/hrefc.css', defaultCss('hrefc').trim() + '\n');

// Ship the hand-written type definitions alongside the JS they describe.
cpSync('src/hrefc.d.ts', 'dist/hrefc.d.ts');

// Vendor the bundle into the docs site so GitHub Pages and the demos work
// immediately, before anything is published to npm.
mkdirSync('docs/assets', { recursive: true });
cpSync('dist/hrefc.global.min.js', 'docs/assets/hrefc.global.min.js');
cpSync('dist/hrefc.css', 'docs/assets/hrefc.css');

const sizeOf = (f) => (statSync('dist/' + f).size / 1024).toFixed(1) + ' KB';
console.log('built dist/  (+ copied to docs/assets/)');
for (const f of ['hrefc.esm.js', 'hrefc.global.js', 'hrefc.global.min.js', 'hrefc.css', 'hrefc.d.ts']) {
  console.log('  ' + f.padEnd(22) + sizeOf(f));
}
