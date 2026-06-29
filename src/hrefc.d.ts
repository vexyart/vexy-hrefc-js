// this_file: src/hrefc.d.ts
// Type definitions for vexy-hrefc.

/** A fetch proxy adapter: returns the target page's HTML, or throws to fall through. */
export type ProxyAdapter = (url: string, signal: AbortSignal) => Promise<string>;

/** A thumbnail provider: returns an image URL, or null to skip to the next. */
export type ThumbnailProvider = (
  url: string,
  data: PreviewData,
  opts: ThumbnailConfig,
) => string | null;

/** Data extracted from a target page and handed to the renderer. */
export interface PreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
}

export interface ContentConfig {
  title?: boolean;
  description?: boolean;
  thumbnail?: boolean;
  favicon?: boolean;
  /** Call-to-action footer text or HTML (e.g. "Click to read more"). Off by default. */
  cta?: string | null;
  descriptionMaxLength?: number;
  stripTitleSuffix?: boolean;
  titleSeparators?: string[];
}

export interface FetchConfig {
  timeout?: number;
  sameOriginDirect?: boolean;
  crossOriginStrategy?: 'proxy' | 'native-first';
  proxies?: Array<ProxyAdapter | 'jina' | 'allorigins' | 'corsproxy'>;
}

export interface ThumbnailConfig {
  width?: number;
  providers?: Array<ThumbnailProvider | 'ogimage' | 'mshots' | 'microlink'>;
  iframe?: boolean;
  iframeViewport?: { width: number; height: number };
}

export interface PopupConfig {
  maxWidth?: number;
  offset?: number;
  placement?: 'auto' | 'top' | 'bottom';
  /** Show the speech-balloon connector pointing at the link. On by default. */
  arrow?: boolean;
  classPrefix?: string;
  appendTo?: HTMLElement | (() => HTMLElement) | null;
  inheritFont?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  injectStyles?: boolean;
  interactive?: boolean;
  zIndex?: number;
}

export interface HrefcConfig {
  selector?: string;
  trigger?: 'hover' | 'click' | 'manual';
  hoverDelay?: number;
  hideDelay?: number;
  content?: ContentConfig;
  fetch?: FetchConfig;
  thumbnail?: ThumbnailConfig;
  cache?: { enabled?: boolean; max?: number };
  popup?: PopupConfig;
  classes?: Record<string, string>;
  render?: ((data: PreviewData, link: HTMLElement) => HTMLElement | string) | null;
  onShow?: ((data: PreviewData, link: HTMLElement, popup: HTMLElement | null) => void) | null;
  onHide?: ((link: HTMLElement | null) => void) | null;
  onError?: ((error: unknown, link: HTMLElement) => void) | null;
}

export declare class Hrefc {
  constructor(config?: HrefcConfig);
  config: Required<HrefcConfig>;
  refresh(root?: ParentNode): this;
  add(target: Element | ArrayLike<Element>): this;
  show(link: HTMLElement): Promise<void> | undefined;
  hide(): this;
  destroy(): void;
}

export interface HrefcFn {
  (config?: HrefcConfig): Hrefc;
  init: HrefcFn;
  auto(): Hrefc;
  defaults: Required<HrefcConfig>;
  proxies: { jina: ProxyAdapter; allorigins: ProxyAdapter; corsproxy: ProxyAdapter };
  thumbnails: Record<string, ThumbnailProvider>;
  Hrefc: typeof Hrefc;
}

export declare const hrefc: HrefcFn;
export declare function auto(): Hrefc;
export declare const defaults: Required<HrefcConfig>;
export declare const proxies: { jina: ProxyAdapter; allorigins: ProxyAdapter; corsproxy: ProxyAdapter };
export declare const thumbnailProviders: Record<string, ThumbnailProvider>;
export default hrefc;
