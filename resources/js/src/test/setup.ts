import '@testing-library/jest-dom/vitest';

// jsdom lacks ResizeObserver, which Recharts' ResponsiveContainer requires.
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// jsdom lacks matchMedia, which some UI libraries probe.
if (typeof globalThis.matchMedia !== 'function') {
    globalThis.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
}

// jsdom lacks scrollIntoView.
Element.prototype.scrollIntoView ??= () => {};
