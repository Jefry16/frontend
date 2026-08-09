import { describe, expect, it } from "vitest";

// No `App*` component exists without a colocated story. KNOWN_MISSING holds the
// backlog and may only shrink. Only the glob KEYS are read — nothing is
// imported, which is what keeps this fast.
const componentFiles = Object.keys(import.meta.glob("/src/**/App*.tsx")).filter(
	(path) =>
		!path.endsWith(".stories.tsx") &&
		!path.endsWith(".test.tsx") &&
		!path.startsWith("/src/components/ui/"),
);
const storyFiles = new Set(
	Object.keys(import.meta.glob("/src/**/*.stories.tsx")),
);

const hasStory = (component: string) =>
	storyFiles.has(component.replace(/\.tsx$/, ".stories.tsx"));

// Add an entry only with a one-line justification. Prefer writing the story.
const EXEMPT = new Set<string>([]);

// Starts empty, and the gate is hard from the first commit. Never add an entry.
const KNOWN_MISSING = new Set<string>([]);

describe("story coverage ratchet", () => {
	it("the component glob is wired (a broken glob must not pass vacuously)", () => {
		expect(componentFiles.length).toBeGreaterThan(0);
	});

	const missing = componentFiles.filter(
		(component) => !hasStory(component) && !EXEMPT.has(component),
	);

	it("every App* component ships a colocated AppX.stories.tsx", () => {
		const newMissing = missing.filter(
			(component) => !KNOWN_MISSING.has(component),
		);
		expect(
			newMissing,
			"New App* component(s) without a story. Build the component in /dev first: " +
				"add a colocated AppX.stories.tsx (see docs/COMPONENTS.md §6). Do NOT add to KNOWN_MISSING; it only shrinks.",
		).toEqual([]);
	});

	it("KNOWN_MISSING lists only components that are still missing a story", () => {
		const stillMissing = new Set(missing);
		const stale = [...KNOWN_MISSING].filter(
			(component) => !stillMissing.has(component),
		);
		expect(
			stale,
			"Stale allow-list: these gained a story or no longer exist — delete them " +
				"from KNOWN_MISSING (the ratchet only tightens).",
		).toEqual([]);
	});

	it("EXEMPT lists only components that exist and have no story", () => {
		const components = new Set(componentFiles);
		const stale = [...EXEMPT].filter(
			(component) => !components.has(component) || hasStory(component),
		);
		expect(
			stale,
			"Stale exemption: these no longer exist or now have a story — delete them from EXEMPT.",
		).toEqual([]);
	});
});
