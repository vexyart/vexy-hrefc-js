//! this_file: src/index.js
import { resolveConfig, defaults } from './config.js';
import { createFetcher } from './fetcher.js';
import { createPopup } from './popup.js';
import * as proxies from './proxies.js';
import { thumbnailProviders } from './thumbnail.js';

/**
 * A running link-preview instance. Scans the DOM for matching links, fetches
 * their targets on intent, and shows a preview popup — silently, when ready.
 */
export class Hrefc {
  constructor(userConfig) {
    this.config = resolveConfig(userConfig);
    this.fetcher = createFetcher(this.config);
    this.popup = createPopup(this.config);
    this._links = new WeakSet();
    this._desired = null; // link the pointer currently wants previewed
    this._active = null; // link whose preview is showing
    this._overCard = false;
    this._showTimer = null;
    this._hideTimer = null;

    this._onEnter = this._onEnter.bind(this);
    this._onLeave = this._onLeave.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onScroll = () => this.popup.reposition();

    this.popup.bind({
      enter: () => {
        this._overCard = true;
        this._clearHide();
      },
      leave: () => {
        this._overCard = false;
        this._scheduleHide();
      },
    });

    this.refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onScroll, { passive: true });
    }
  }

  /** Scan `root` for matching links and attach to any new ones. */
  refresh(root = document) {
    root.querySelectorAll(this.config.selector).forEach((link) => this._attach(link));
    return this;
  }

  /** Attach to a specific Element or list of Elements. */
  add(target) {
    const list =
      target instanceof Element
        ? [target]
        : target && target.length != null
          ? Array.prototype.slice.call(target)
          : [];
    list.forEach((el) => this._attach(el));
    return this;
  }

  /** Programmatically show the preview for a link (bypasses hover intent). */
  show(link) {
    return this._trigger(link, true);
  }

  /** Hide the popup now. */
  hide() {
    this._clearShow();
    this.popup.hide();
    this._active = null;
    return this;
  }

  _attach(link) {
    if (this._links.has(link)) return;
    this._links.add(link);
    const trig = this.config.trigger;
    if (trig === 'click') {
      link.addEventListener('click', this._onClick);
    } else if (trig !== 'manual') {
      link.addEventListener('pointerenter', this._onEnter);
      link.addEventListener('pointerleave', this._onLeave);
      link.addEventListener('focus', this._onEnter);
      link.addEventListener('blur', this._onLeave);
    }
  }

  _onEnter(e) {
    const link = e.currentTarget;
    this._desired = link;
    this._clearHide();
    this._clearShow();
    this._showTimer = setTimeout(() => this._trigger(link, false), this.config.hoverDelay);
  }

  _onLeave() {
    this._desired = null;
    this._clearShow();
    this._scheduleHide();
  }

  _onClick(e) {
    e.preventDefault();
    this._desired = e.currentTarget;
    this._trigger(e.currentTarget, true);
  }

  _trigger(link, force) {
    const href = link.getAttribute('href');
    if (!href) return;
    let abs;
    try {
      abs = new URL(href, location.href).href;
    } catch {
      return;
    }
    return this.fetcher
      .getData(abs)
      .then((data) => {
        // Drop stale results: only show if still wanted (or forced via click/API).
        if (!force && this._desired !== link) return;
        this.popup.show(data, link);
        this._active = link;
        this._fire('onShow', data, link, this.popup.element);
      })
      .catch((err) => {
        // Silent by design: nothing appears. Hook lets you log if you want to.
        this._fire('onError', err, link);
      });
  }

  _scheduleHide() {
    this._clearHide();
    this._hideTimer = setTimeout(() => {
      if (this._overCard) return;
      this.popup.hide();
      this._fire('onHide', this._active);
      this._active = null;
    }, this.config.hideDelay);
  }

  _clearShow() {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
  }

  _clearHide() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  _fire(name, ...args) {
    const fn = this.config[name];
    if (typeof fn === 'function') {
      try {
        fn(...args);
      } catch {
        /* hooks never break the page */
      }
    }
  }

  /** Remove every listener and the popup element. */
  destroy() {
    this._clearShow();
    this._clearHide();
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this._onScroll);
      window.removeEventListener('resize', this._onScroll);
    }
    this.popup.destroy();
    this._links = new WeakSet();
  }
}

/** Create and start an instance. The one-liner most people want. */
export function hrefc(config) {
  return new Hrefc(config);
}

/** Start from `window.HrefcConfig` (or defaults), for the script-tag crowd. */
export function auto() {
  const cfg = (typeof window !== 'undefined' && window.HrefcConfig) || {};
  return hrefc(cfg);
}

hrefc.init = hrefc;
hrefc.auto = auto;
hrefc.defaults = defaults;
hrefc.proxies = proxies;
hrefc.thumbnails = thumbnailProviders;
hrefc.Hrefc = Hrefc;

export { defaults, proxies, thumbnailProviders };
export default hrefc;
