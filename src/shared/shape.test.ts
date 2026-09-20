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

const CLASS_STRING = /"[^"\n]*\brounded-full\b[^"\n]*"/g;
const STATE_DOT = /\bsize-1\.5\b/;

const RESTING_SHADOW =
	/"[^"\n]*(?<![\w-])shadow(?:-2xs|-xs|-sm)?(?![\w-])[^"\n]*"/g;

describe("one shape: the radius, and a dot for a state", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(scannable.length).toBeGreaterThan(80);
	});

	it("nothing is a circle or a pill but a state dot", () => {
		const offenders = scannable.flatMap((path) =>
			[
				...readFileSync(join(ROOT, path.slice(1)), "utf8").matchAll(
					CLASS_STRING,
				),
			]
				.filter(([classes]) => !STATE_DOT.test(classes))
				.map(([classes]) => `${path}: ${classes}`),
		);
		expect(
			offenders,
			"`rounded-full` makes a second shape. A tile, a well, a chip and a " +
				"button take the radius (`rounded-lg`, or `rounded-md` inside a " +
				"tile). The one circle is a `size-1.5` dot that marks a state. A " +
				"round primitive is wrapped in the package, as AppAvatar is.",
		).toEqual([]);
	});

	it("nothing at rest casts a shadow", () => {
		const offenders = scannable.flatMap((path) =>
			[
				...readFileSync(join(ROOT, path.slice(1)), "utf8").matchAll(
					RESTING_SHADOW,
				),
			].map(([classes]) => `${path}: ${classes}`),
		);
		expect(
			offenders,
			"`shadow`, `shadow-xs` and `shadow-sm` lift a surface that is not " +
				"floating. A card, a table and a tab sit on the page by lightness " +
				"and a hairline. `shadow-md` and up is for what floats: a menu, a " +
				"popover, a sheet.",
		).toEqual([]);
	});
});
