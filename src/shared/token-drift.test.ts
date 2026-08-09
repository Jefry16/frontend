import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// The tokens-only styling ratchet: no raw Tailwind palette classes and no
// arbitrary values in our code — every visual decision comes from the design
// tokens in src/styles.css (or a CVA variant built on them). Always hard for
// NEW code; the pre-existing drift lives in KNOWN_DRIFT (a per-file violation
// count), which can only shrink — fix an instance and the count must come
// down, so the list burns toward empty and the gate becomes fully hard.
//
// Sibling gate: `shared/form-pattern.test.ts` does the same job for §5 forms.
//
// Scanned: src/**/*.{ts,tsx}. Excluded: components/ui/ (vendored shadcn),
// paraglide/ (generated), routeTree.gen.ts (generated), *.test.* (this file
// would match its own patterns).
const ROOT = process.cwd();
const files: string[] = [];
const walk = (dir: string) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
	}
};
walk(join(ROOT, "src"));

const scannable = files
	.map((file) => `/${relative(ROOT, file)}`)
	.filter(
		(path) =>
			!path.startsWith("/src/components/ui/") &&
			!path.startsWith("/src/paraglide/") &&
			path !== "/src/routeTree.gen.ts" &&
			!/\.test\.tsx?$/.test(path),
	);

// Raw palette classes (`text-amber-700`, `dark:bg-blue-500/50`) and raw
// white/black (`bg-white`, `ring-black/5`) — use a semantic token instead;
// if none fits, add one to styles.css first.
const RAW_PALETTE =
	/(?:^|[\s"'`{:!])((?:[a-z-]+:)*(?:text|bg|border|ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow|placeholder)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]50|[1-9]00)|white|black)(?:\/\d+)?)\b/g;

// Arbitrary values (`w-[347px]`, `rounded-[1.3rem]`, `h-[calc(100vh-7rem)]`).
// NOT flagged, by design:
//  - variant selectors (`data-[state=open]:`, `aria-[…]`, `supports-[…]`) —
//    those are conditions, not values;
//  - pure CSS-var references (`w-[var(--radix-popover-trigger-width)]`) —
//    the value comes from a variable, not an ad-hoc literal;
//  - grid track lists (`grid-cols-[max-content_1fr]`) — layout composition
//    with no Tailwind token vocabulary to prefer.
const ARBITRARY =
	/(?:^|[\s"'`{:!])((?:[a-z-]+:)*([a-z][a-z0-9-]*)-\[([^\]]*)\])/g;
const VARIANT_UTILITIES =
	/^(?:data|aria|group-data|group-aria|peer-data|peer-aria|supports|has|nth|not-data|in-data|max|min)$/;
const ALLOWED_ARBITRARY = (utility: string, value: string) =>
	/^var\(--[\w-]+\)$/.test(value) ||
	utility === "grid-cols" ||
	utility === "grid-rows";

const violationsIn = (source: string): string[] => {
	const hits: string[] = [];
	for (const match of source.matchAll(RAW_PALETTE)) hits.push(match[1]);
	for (const match of source.matchAll(ARBITRARY)) {
		const [, cls, utility, value] = match;
		if (VARIANT_UTILITIES.test(utility)) continue;
		if (ALLOWED_ARBITRARY(utility, value)) continue;
		hits.push(cls);
	}
	return hits;
};

// Ported from the archive (`src/dev/token-drift.test.ts`), where it burned its
// own drift to empty in a day. This repo is the rebuild and never had the gate,
// so five violations had accumulated since July — `max-h-[600px]`,
// `max-w-[180px]`, `ring-[3px]`, `max-h-[60vh]` and a `w-[32rem]` in a story.
// All five were fixed before this landed, so KNOWN_DRIFT starts EMPTY and the
// gate is hard from the first commit. Never add an entry.
const KNOWN_DRIFT: Record<string, number> = {};

describe("token drift ratchet", () => {
	const byFile = new Map<string, string[]>();
	for (const path of scannable) {
		const hits = violationsIn(readFileSync(join(ROOT, path.slice(1)), "utf8"));
		if (hits.length > 0) byFile.set(path, hits);
	}

	it("the source walk is wired (a broken walk must not pass vacuously)", () => {
		expect(scannable.length).toBeGreaterThan(0);
	});

	it("no raw palette classes or arbitrary values outside KNOWN_DRIFT", () => {
		const offenses = [...byFile.entries()]
			.filter(([path, hits]) => hits.length > (KNOWN_DRIFT[path] ?? 0))
			.map(([path, hits]) => `${path}: ${hits.join(" ")}`);
		expect(
			offenses,
			"Raw palette class or arbitrary value in new code. Use a design token " +
				"from src/styles.css (or add one, or a CVA variant) — see the styling " +
				"rules in CLAUDE.md. Do NOT add to KNOWN_DRIFT; it only shrinks.",
		).toEqual([]);
	});

	it("KNOWN_DRIFT counts match reality (the ratchet only tightens)", () => {
		const stale = Object.entries(KNOWN_DRIFT)
			.filter(([path, allowed]) => (byFile.get(path)?.length ?? 0) < allowed)
			.map(
				([path, allowed]) =>
					`${path}: allows ${allowed}, found ${byFile.get(path)?.length ?? 0}`,
			);
		expect(
			stale,
			"Stale allow-list: drift was fixed (or the file is gone) — lower or " +
				"delete these KNOWN_DRIFT entries so the ratchet tightens.",
		).toEqual([]);
	});
});
