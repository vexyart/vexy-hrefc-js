//! this_file: src/styles.js
// Default CSS for the popup. Inherits the host page's font and color, follows the
// system dark/light setting, and exposes every knob as a `--<prefix>-*` variable.
//
// Structure: an outer `.popup` (positioning + fade + theme variables) wraps a
// visual `.card` and a `.arrow` connector. Variables live on `.popup` so both the
// card and the arrow read the same colours.

/** Build the default stylesheet for a given class prefix. */
export function defaultCss(prefix = 'hrefc', opts = {}) {
  const p = prefix;
  const z = opts.zIndex || 9999;
  const maxW = opts.maxWidth || 360;
  const font = opts.inheritFont === false ? 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif' : 'inherit';
  return `
.${p}-popup{position:fixed;left:0;top:0;z-index:${z};
  --${p}-bg:#fff;--${p}-fg:#1a1a1a;--${p}-border:rgba(0,0,0,.12);--${p}-radius:12px;
  --${p}-shadow:0 8px 30px rgba(0,0,0,.16);--${p}-desc:rgba(0,0,0,.66);--${p}-thumb-bg:rgba(0,0,0,.04);
  opacity:0;transform:translateY(6px);transition:opacity .18s ease,transform .18s cubic-bezier(.16,1,.3,1);
  pointer-events:none;}
.${p}-popup[data-show="1"]{opacity:1;transform:none;pointer-events:auto;}
.${p}-popup *{box-sizing:border-box;}
.${p}-card{position:relative;z-index:0;max-width:${maxW}px;overflow:hidden;
  font-family:${font};color:var(--${p}-fg);background:var(--${p}-bg);
  border:1px solid var(--${p}-border);border-radius:var(--${p}-radius);
  box-shadow:var(--${p}-shadow);padding:var(--${p}-pad,12px 14px);
  font-size:var(--${p}-size,14px);line-height:1.45;text-align:left;cursor:pointer;}
.${p}-arrow{position:absolute;z-index:1;width:12px;height:12px;background:var(--${p}-bg);transform:rotate(45deg);}
.${p}-popup[data-placement="top"] .${p}-arrow{bottom:-6px;
  border-right:1px solid var(--${p}-border);border-bottom:1px solid var(--${p}-border);}
.${p}-popup[data-placement="bottom"] .${p}-arrow{top:-6px;
  border-left:1px solid var(--${p}-border);border-top:1px solid var(--${p}-border);}
.${p}-head{display:flex;align-items:center;gap:8px;margin:0 0 4px;}
.${p}-favicon{width:16px;height:16px;flex:0 0 16px;border-radius:3px;object-fit:contain;}
.${p}-title{font-weight:600;font-size:1em;margin:0;color:var(--${p}-title,inherit);text-wrap:balance;}
.${p}-desc{margin:2px 0 0;font-size:.92em;color:var(--${p}-desc);}
.${p}-cta{display:block;margin-top:.5em;font-size:.85em;color:var(--${p}-cta,inherit);}
.${p}-thumb{display:none;height:auto;border-radius:8px;background:var(--${p}-thumb-bg);}
.${p}-thumb-wide{display:block;width:100%;margin:0 0 10px;}
.${p}-thumb-half{display:block;width:50%;float:right;margin:.1em 0 .55em .85em;}
.${p}-thumb-float{display:block;width:33%;float:right;margin:.1em 0 .55em .85em;}
.${p}-thumb-frame{position:relative;width:100%;margin:0 0 10px;border-radius:8px;overflow:hidden;background:var(--${p}-thumb-bg);}
.${p}-thumb-frame iframe{position:absolute;top:0;left:0;border:0;transform-origin:0 0;}
@media (prefers-color-scheme:dark){
  .${p}-popup{--${p}-bg:#1e1f22;--${p}-fg:#e9e9ea;--${p}-border:rgba(255,255,255,.14);
    --${p}-shadow:0 8px 30px rgba(0,0,0,.5);--${p}-desc:rgba(255,255,255,.66);--${p}-thumb-bg:rgba(255,255,255,.06);}
}
.${p}-popup[data-theme="light"]{--${p}-bg:#fff;--${p}-fg:#1a1a1a;--${p}-border:rgba(0,0,0,.12);
  --${p}-shadow:0 8px 30px rgba(0,0,0,.16);--${p}-desc:rgba(0,0,0,.66);--${p}-thumb-bg:rgba(0,0,0,.04);}
.${p}-popup[data-theme="dark"]{--${p}-bg:#1e1f22;--${p}-fg:#e9e9ea;--${p}-border:rgba(255,255,255,.14);
  --${p}-shadow:0 8px 30px rgba(0,0,0,.5);--${p}-desc:rgba(255,255,255,.66);--${p}-thumb-bg:rgba(255,255,255,.06);}
@media (prefers-reduced-motion:reduce){.${p}-popup{transition:opacity .18s ease;transform:none;}}
`;
}

const injectedPrefixes = new Set();

/** Inject the default stylesheet once per prefix, at the top of <head> so that
 *  any page CSS placed later wins without needing !important. */
export function injectStyles(doc, prefix, opts) {
  if (injectedPrefixes.has(prefix)) return;
  const style = doc.createElement('style');
  style.setAttribute('data-' + prefix + '-styles', '');
  style.textContent = defaultCss(prefix, opts);
  const head = doc.head || doc.documentElement;
  head.insertBefore(style, head.firstChild);
  injectedPrefixes.add(prefix);
}
