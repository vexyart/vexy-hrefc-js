//! this_file: src/styles.js
// Default CSS for the popup. Inherits the host page's font and color, follows the
// system dark/light setting, and exposes every knob as a `--<prefix>-*` variable.

/** Build the default stylesheet for a given class prefix. */
export function defaultCss(prefix = 'hrefc', opts = {}) {
  const p = prefix;
  const z = opts.zIndex || 9999;
  const maxW = opts.maxWidth || 360;
  const font = opts.inheritFont === false ? 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif' : 'inherit';
  return `
.${p}-popup{position:fixed;left:0;top:0;z-index:${z};max-width:${maxW}px;
  font-family:${font};color:var(--${p}-fg,#1a1a1a);background:var(--${p}-bg,#fff);
  border:1px solid var(--${p}-border,rgba(0,0,0,.12));border-radius:var(--${p}-radius,12px);
  box-shadow:var(--${p}-shadow,0 8px 30px rgba(0,0,0,.16));padding:var(--${p}-pad,12px 14px);
  font-size:var(--${p}-size,14px);line-height:1.45;text-align:left;box-sizing:border-box;
  opacity:0;transform:translateY(4px);transition:opacity .14s ease,transform .14s ease;
  pointer-events:none;overflow:hidden;}
.${p}-popup[data-show="1"]{opacity:1;transform:none;pointer-events:auto;}
.${p}-popup *{box-sizing:border-box;}
.${p}-head{display:flex;align-items:center;gap:8px;margin:0 0 4px;}
.${p}-favicon{width:16px;height:16px;flex:0 0 16px;border-radius:3px;object-fit:contain;}
.${p}-title{font-weight:600;font-size:1em;margin:0;color:var(--${p}-title,inherit);}
.${p}-desc{margin:2px 0 0;font-size:.92em;color:var(--${p}-desc,rgba(0,0,0,.66));}
.${p}-thumb{display:block;width:100%;height:auto;margin-top:10px;border-radius:8px;
  background:var(--${p}-thumb-bg,rgba(0,0,0,.04));}
.${p}-thumb-frame{position:relative;width:100%;margin-top:10px;border-radius:8px;overflow:hidden;
  background:var(--${p}-thumb-bg,rgba(0,0,0,.04));}
.${p}-thumb-frame iframe{position:absolute;top:0;left:0;border:0;transform-origin:0 0;}
.${p}-thumb-frame::after{content:"";position:absolute;inset:0;}
@media (prefers-color-scheme:dark){
  .${p}-popup{--${p}-fg:#e9e9ea;--${p}-bg:#1e1f22;--${p}-border:rgba(255,255,255,.14);
    --${p}-shadow:0 8px 30px rgba(0,0,0,.5);--${p}-desc:rgba(255,255,255,.66);
    --${p}-thumb-bg:rgba(255,255,255,.06);}
}
.${p}-popup[data-theme="light"]{--${p}-fg:#1a1a1a;--${p}-bg:#fff;--${p}-border:rgba(0,0,0,.12);
  --${p}-shadow:0 8px 30px rgba(0,0,0,.16);--${p}-desc:rgba(0,0,0,.66);--${p}-thumb-bg:rgba(0,0,0,.04);}
.${p}-popup[data-theme="dark"]{--${p}-fg:#e9e9ea;--${p}-bg:#1e1f22;--${p}-border:rgba(255,255,255,.14);
  --${p}-shadow:0 8px 30px rgba(0,0,0,.5);--${p}-desc:rgba(255,255,255,.66);--${p}-thumb-bg:rgba(255,255,255,.06);}
@media (prefers-reduced-motion:reduce){.${p}-popup{transition:none;transform:none;}}
`;
}

const injectedPrefixes = new Set();

/** Inject the default stylesheet once per prefix. */
export function injectStyles(doc, prefix, opts) {
  if (injectedPrefixes.has(prefix)) return;
  const style = doc.createElement('style');
  style.setAttribute('data-' + prefix + '-styles', '');
  style.textContent = defaultCss(prefix, opts);
  (doc.head || doc.documentElement).appendChild(style);
  injectedPrefixes.add(prefix);
}
