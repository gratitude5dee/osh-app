import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverPolyfill;
(window as any).ResizeObserver = ResizeObserverPolyfill;
(global as any).ResizeObserver = ResizeObserverPolyfill;

class IntersectionObserverPolyfill {
  constructor(_cb: unknown, _opts?: unknown) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "";
  thresholds = [];
}
(globalThis as any).IntersectionObserver = IntersectionObserverPolyfill;
(window as any).IntersectionObserver = IntersectionObserverPolyfill;
(global as any).IntersectionObserver = IntersectionObserverPolyfill;

if (!(window as any).PointerEvent) {
  (window as any).PointerEvent = class PointerEvent extends Event {} as any;
}
(Element.prototype as any).hasPointerCapture = (Element.prototype as any).hasPointerCapture ?? (() => false);
(Element.prototype as any).setPointerCapture = (Element.prototype as any).setPointerCapture ?? (() => {});
(Element.prototype as any).releasePointerCapture = (Element.prototype as any).releasePointerCapture ?? (() => {});
(Element.prototype as any).scrollIntoView = (Element.prototype as any).scrollIntoView ?? (() => {});
