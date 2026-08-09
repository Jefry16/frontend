import { describe, expect, it } from "vitest";

// The story-first coverage ratchet: no `App*` component exists without a
// colocated `AppX.stories.tsx` in the /dev gallery. Always hard for NEW code;
// the pre-existing backlog lives in KNOWN_MISSING, which can only shrink —
// an entry that gains a story (or is deleted) must be removed, so once the
// backfill waves empty the list the gate is fully hard with no special cases.
//
// Sibling gates: `token-drift.test.ts` (styling) and `form-pattern.test.ts` (§5).
//
// Vite-root glob paths: only the KEYS are read — no story or component module
// is ever imported, so this test stays fast.
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

// Components that legitimately have no visual story. Keep this TINY — prefer a
// real story; add an entry only with a one-line justification.
//
// EMPTY here. The archive exempted its dev gallery shell and two theme-editor
// page shells; none of those exist in this rebuild.
const EXEMPT = new Set<string>([]);

// Ported from the archive (`src/dev/story-coverage.test.ts`), where a 96-entry
// backlog was burned down over PRs #42–#60. This repo had five gaps — the four
// table internals COMPONENTS.md had listed as debt since July, plus
// AppBrandImageSlot, which I added earlier in this arc and never storied. All
// five were written before this landed, so KNOWN_MISSING starts EMPTY and the
// gate is hard from the first commit. Never add an entry.
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
