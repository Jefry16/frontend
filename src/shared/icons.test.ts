import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const files: string[] = [];
const walk = (dir: string) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.tsx?$/.test(entry.name)) files.push(full);
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

const LUCIDE_IMPORT = /import\s*\{([^}]*)\}\s*from\s*"lucide-react"/g;
const ALLOWED_SIZES = new Set(["size-4", "size-8"]);

const lucideNames = (source: string): string[] =>
	[...source.matchAll(LUCIDE_IMPORT)].flatMap(([, list]) =>
		list
			.split(",")
			.map((entry) => entry.trim())
			.filter((entry) => entry !== "" && !entry.startsWith("type "))
			.map((entry) => entry.split(/\s+as\s+/).at(-1) ?? entry),
	);

const iconElements = (source: string, names: string[]): string[] => {
	const local = names.length > 0 ? `${names.join("|")}|` : "";
	const tag = new RegExp(`<(?:${local}[A-Z]\\w*Icon)\\b[^>]*>`, "g");
	return [...source.matchAll(tag)].map(([element]) => element);
};

const violationsIn = (source: string): string[] => {
	const hits: string[] = [];
	const names = lucideNames(source);
	for (const name of names) if (/Icon$/.test(name)) hits.push(`import ${name}`);
	for (const element of iconElements(source, names)) {
		for (const [cls] of element.matchAll(/\bsize-[\d.]+\b/g))
			if (!ALLOWED_SIZES.has(cls)) hits.push(`${cls} on ${element}`);
		for (const [cls] of element.matchAll(/\bopacity-\d+\b/g))
			hits.push(`${cls} on ${element}`);
	}
	return hits;
};

describe("icons", () => {
	const byFile = new Map<string, string[]>();
	for (const path of scannable) {
		const hits = violationsIn(readFileSync(join(ROOT, path.slice(1)), "utf8"));
		if (hits.length > 0) byFile.set(path, hits);
	}

	it("the source walk is wired (a broken walk must not pass vacuously)", () => {
		expect(scannable.length).toBeGreaterThan(0);
		expect(
			scannable.some((path) =>
				lucideNames(readFileSync(join(ROOT, path.slice(1)), "utf8")).includes(
					"Trash2",
				),
			),
		).toBe(true);
	});

	it("an icon is inline (no size, or size-4 outside a button) or a well (size-8), and never muted by opacity", () => {
		expect(
			[...byFile.entries()].map(
				([path, hits]) => `${path}: ${hits.join(", ")}`,
			),
			"An icon takes its size from its container, or size-4 beside text " +
				"with none, or size-8 text-muted-foreground in an empty well. Muting " +
				"is text-muted-foreground, never opacity-*. Import the bare Lucide " +
				"name, not the Icon-suffixed alias. See DESIGN.md (Icons) in the ui repo.",
		).toEqual([]);
	});
});
