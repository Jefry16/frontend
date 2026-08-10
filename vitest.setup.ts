import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { setOnAuthExpired } from "#/lib/api";
import { clearAccessToken } from "#/lib/tokens";
import { server } from "#/test/server";

// jsdom doesn't ship matchMedia; stub it so components that use the
// shadcn use-mobile hook (and its consumers) render in tests.
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// jsdom doesn't ship IntersectionObserver either. AppDataTable watches a
// sentinel with one to drive infinite scroll, so without this the table cannot
// be rendered in a test at all — which is a large part of why it never was.
// The stub never reports an intersection: a test that wants the next page
// should assert on the fetch, not on scrolling.
class NoopIntersectionObserver implements IntersectionObserver {
	readonly root = null;
	readonly rootMargin = "";
	readonly thresholds: readonly number[] = [];
	disconnect() {}
	observe() {}
	unobserve() {}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}
vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);

// jsdom implements no Pointer Capture and no scrollIntoView, and Radix Select
// calls both while opening. Without these a click on any select trigger throws
// `target.hasPointerCapture is not a function` and the listbox never mounts —
// which makes every select in the app untestable, not just one.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => undefined;
Element.prototype.releasePointerCapture ??= () => undefined;
Element.prototype.scrollIntoView ??= () => undefined;

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
	clearAccessToken();
	setOnAuthExpired(null);
});

afterEach(() => {
	cleanup();
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});
