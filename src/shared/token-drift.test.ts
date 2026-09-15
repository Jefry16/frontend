import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

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
			!path.startsWith("/src/paraglide/") &&
			path !== "/src/routeTree.gen.ts" &&
			!/\.test\.tsx?$/.test(path),
	);

const RAW_PALETTE =
	/(?:^|[\s"'`{:!])((?:[a-z-]+:)*(?:text|bg|border|ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow|placeholder)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]50|[1-9]00)|white|black)(?:\/\d+)?)\b/g;

const ARBITRARY =
	/(?:^|[\s"'`{:!])((?:[a-z-]+:)*([a-z][a-z0-9-]*)-\[([^\]]*)\])/g;
const VARIANT_UTILITIES =
	/^(?:data|aria|group-data|group-aria|peer-data|peer-aria|supports|has|nth|not-data|in-data|max|min)$/;
const ALLOWED_ARBITRARY = (utility: string, value: string) =>
	/^var\(--[\w-]+\)$/.test(value) ||
	utility === "grid-cols" ||
	utility === "grid-rows";

const INLINE_STYLE = /\bstyle=\{/g;
const OPERATOR_TYPED_COLOURS = new Set([
	"/src/tour-operator/components/AppOperatorColorsCard.tsx",
]);

const violationsIn = (path: string, source: string): string[] => {
	const hits: string[] = [];
	for (const match of source.matchAll(RAW_PALETTE)) hits.push(match[1]);
	for (const match of source.matchAll(ARBITRARY)) {
		const [, cls, utility, value] = match;
		if (VARIANT_UTILITIES.test(utility)) continue;
		if (ALLOWED_ARBITRARY(utility, value)) continue;
		hits.push(cls);
	}
	if (!OPERATOR_TYPED_COLOURS.has(path))
		for (const match of source.matchAll(INLINE_STYLE)) hits.push(match[0]);
	return hits;
};

const KNOWN_DRIFT: Record<string, number> = {};

describe("token drift ratchet", () => {
	const byFile = new Map<string, string[]>();
	for (const path of scannable) {
		const hits = violationsIn(
			path,
			readFileSync(join(ROOT, path.slice(1)), "utf8"),
		);
		if (hits.length > 0) byFile.set(path, hits);
	}

	it("the source walk is wired (a broken walk must not pass vacuously)", () => {
		expect(scannable.length).toBeGreaterThan(0);
	});

	it("no raw palette classes, arbitrary values or inline styles outside KNOWN_DRIFT", () => {
		const offenses = [...byFile.entries()]
			.filter(([path, hits]) => hits.length > (KNOWN_DRIFT[path] ?? 0))
			.map(([path, hits]) => `${path}: ${hits.join(" ")}`);
		expect(
			offenses,
			"Raw palette class, arbitrary value or style={} in new code. Use a design " +
				"token from src/styles.css (or add one, or a CVA variant). An inline " +
				"style is allowed only where the colour is one the operator typed in " +
				"(OPERATOR_TYPED_COLOURS). Do NOT add to KNOWN_DRIFT; it only shrinks.",
		).toEqual([]);
	});

	it("every OPERATOR_TYPED_COLOURS file still needs its inline style", () => {
		const stale = [...OPERATOR_TYPED_COLOURS].filter(
			(path) =>
				!scannable.includes(path) ||
				[
					...readFileSync(join(ROOT, path.slice(1)), "utf8").matchAll(
						INLINE_STYLE,
					),
				].length === 0,
		);
		expect(
			stale,
			"Stale exception: the file no longer renders an operator-typed colour " +
				"inline (or is gone) — remove it from OPERATOR_TYPED_COLOURS.",
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
