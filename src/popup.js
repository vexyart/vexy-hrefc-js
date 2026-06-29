//! this_file: src/popup.js
import { injectStyles } from './styles.js';
import { resolveThumbnail } from './thumbnail.js';

/**
 * A single reusable popup with positioning and content rendering.
 * It shows only when content is handed to it; it never shows a loading state.
 *
 * DOM: .popup (positioning + fade) > [ .arrow, .card (the visible content) ].
 */
export function createPopup(config) {
  const doc = document;
  const prefix = config.popup.classPrefix || 'hrefc';
  const cls = Object.assign(
    {
      popup: prefix + '-popup',
      card: prefix + '-card',
      arrow: prefix + '-arrow',
      head: prefix + '-head',
      favicon: prefix + '-favicon',
      title: prefix + '-title',
      desc: prefix + '-desc',
      cta: prefix + '-cta',
      thumb: prefix + '-thumb',
      frame: prefix + '-thumb-frame',
    },
    config.classes || {},
  );

  if (config.popup.injectStyles !== false) {
    injectStyles(doc, prefix, {
      zIndex: config.popup.zIndex,
      maxWidth: config.popup.maxWidth,
      inheritFont: config.popup.inheritFont,
    });
  }

  const showArrow = config.popup.arrow !== false;
  let el = null;
  let card = null;
  let arrow = null;
  let currentLink = null;
  let handlers = { enter: null, leave: null };

  function appendTarget() {
    const at = config.popup.appendTo;
    if (typeof at === 'function') return at() || doc.body;
    return at || doc.body;
  }

  function ensureEl() {
    if (el) return el;
    el = doc.createElement('div');
    el.className = cls.popup;
    el.setAttribute('role', 'tooltip');
    el.style.zIndex = String(config.popup.zIndex || 9999);
    if (config.popup.theme && config.popup.theme !== 'auto') {
      el.setAttribute('data-theme', config.popup.theme);
    }

    if (showArrow) {
      arrow = doc.createElement('div');
      arrow.className = cls.arrow;
      el.appendChild(arrow);
    }
    card = doc.createElement('div');
    card.className = cls.card;
    card.style.maxWidth = (config.popup.maxWidth || 360) + 'px';
    el.appendChild(card);

    if (config.popup.interactive) {
      card.style.cursor = 'pointer';
      el.addEventListener('pointerenter', () => handlers.enter && handlers.enter());
      el.addEventListener('pointerleave', () => handlers.leave && handlers.leave());
      el.addEventListener('click', (e) => {
        if (e.target.closest('a,button')) return;
        const href = currentLink && currentLink.getAttribute('href');
        if (href) window.location.href = href;
      });
    }
    appendTarget().appendChild(el);
    return el;
  }

  function bind(h) {
    handlers = h;
  }

  function buildContent(data, link) {
    if (typeof config.render === 'function') {
      const r = config.render(data, link);
      if (r instanceof Node) return r;
      const wrap = doc.createElement('div');
      wrap.innerHTML = String(r == null ? '' : r);
      return wrap;
    }
    const frag = doc.createDocumentFragment();
    const head = doc.createElement('div');
    head.className = cls.head;
    let hasHead = false;

    if (config.content.favicon && data.favicon) {
      const ic = doc.createElement('img');
      ic.className = cls.favicon;
      ic.src = data.favicon;
      ic.alt = '';
      ic.addEventListener('error', () => ic.remove());
      head.appendChild(ic);
      hasHead = true;
    }
    if (config.content.title !== false && data.title) {
      const t = doc.createElement('span');
      t.className = cls.title;
      t.textContent = data.title;
      head.appendChild(t);
      hasHead = true;
    }
    if (hasHead) frag.appendChild(head);

    if (config.content.description !== false && data.description) {
      const d = doc.createElement('p');
      d.className = cls.desc;
      d.textContent = data.description;
      frag.appendChild(d);
    }
    if (config.content.thumbnail) attachThumb(frag, data, link);

    // Optional call-to-action footer (e.g. "Click to read more"). Author-supplied
    // config, so an HTML string is allowed and set as innerHTML.
    if (config.content.cta) {
      const cta = doc.createElement('div');
      cta.className = cls.cta;
      cta.innerHTML = String(config.content.cta);
      frag.appendChild(cta);
    }
    return frag;
  }

  function attachThumb(parent, data, link) {
    const url = data.url || link.getAttribute('href');
    const src = resolveThumbnail(url, data, config.thumbnail);
    if (src) {
      const img = doc.createElement('img');
      img.className = cls.thumb;
      img.loading = 'lazy';
      img.alt = '';
      img.addEventListener('load', () => reposition());
      img.addEventListener('error', () => {
        img.remove();
        if (config.thumbnail.iframe) attachIframe(parent, url);
        reposition();
      });
      img.src = src;
      parent.appendChild(img);
    } else if (config.thumbnail.iframe) {
      attachIframe(parent, url);
    }
  }

  function attachIframe(parent, url) {
    const vp = config.thumbnail.iframeViewport || { width: 1280, height: 800 };
    const box = doc.createElement('div');
    box.className = cls.frame;
    const frame = doc.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.width = String(vp.width);
    frame.height = String(vp.height);
    frame.src = url;
    box.appendChild(frame);
    parent.appendChild(box);
    requestAnimationFrame(() => {
      const w = box.clientWidth || (config.popup.maxWidth || 360) - 28;
      const scale = w / vp.width;
      frame.style.transform = 'scale(' + scale + ')';
      box.style.height = vp.height * scale + 'px';
      reposition();
    });
  }

  function position(link) {
    if (!el) return;
    const r = link.getBoundingClientRect();
    const pr = el.getBoundingClientRect();
    const offset = config.popup.offset || 12;
    const margin = 8;
    const vw = doc.documentElement.clientWidth;
    const vh = doc.documentElement.clientHeight;

    // Default: above the link. Flip below only when there's no room above.
    let placement = config.popup.placement || 'auto';
    if (placement === 'auto') {
      const fitsAbove = r.top > pr.height + offset;
      const fitsBelow = vh - r.bottom > pr.height + offset;
      placement = fitsAbove ? 'top' : fitsBelow ? 'bottom' : 'top';
    }
    let top = placement === 'top' ? r.top - pr.height - offset : r.bottom + offset;
    // Centre the card over the link; clamping below keeps it on-screen.
    let left = r.left + r.width / 2 - pr.width / 2;

    if (left + pr.width > vw - margin) left = vw - margin - pr.width;
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    if (top + pr.height > vh - margin) top = Math.max(margin, vh - margin - pr.height);

    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
    el.setAttribute('data-placement', placement);

    // Point the arrow at the link's horizontal centre, clamped to the card.
    if (arrow) {
      const linkCenter = r.left + r.width / 2;
      let ax = linkCenter - left - 6; // 6 = half the 12px arrow
      ax = Math.max(10, Math.min(pr.width - 22, ax));
      arrow.style.left = Math.round(ax) + 'px';
    }
  }

  function reposition() {
    if (currentLink && el && el.getAttribute('data-show') === '1') position(currentLink);
  }

  function show(data, link) {
    ensureEl();
    currentLink = link;
    if (config.popup.theme === 'auto') el.removeAttribute('data-theme');
    card.innerHTML = '';
    card.appendChild(buildContent(data, link));
    position(link);
    requestAnimationFrame(() => {
      position(link);
      el.setAttribute('data-show', '1');
    });
  }

  function hide() {
    if (!el) return;
    el.removeAttribute('data-show');
    currentLink = null;
  }

  function destroy() {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null;
    card = null;
    arrow = null;
    currentLink = null;
  }

  return {
    show,
    hide,
    destroy,
    bind,
    reposition,
    get element() {
      return el;
    },
  };
}
