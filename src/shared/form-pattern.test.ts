import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const RAW_CONTROLS =
	/<(Input|Textarea|Checkbox|Select|select|input|textarea|RadioGroup|Switch)[\s/>]/;

const RENDERS_A_FORM = /<(form|AppFormCard)[\s>]/;

const FROZEN = new Set<string>();

const walk = (dir: string): string[] =>
	readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return walk(path);
		return path.endsWith(".tsx") && !path.includes(".test.") ? [path] : [];
	});

describe("COMPONENTS.md §5 — forms use the field renderers", () => {
	it("no form renders a raw control instead of a field renderer", () => {
		const offenders = walk("src")
			.map((path) => ({ path, src: readFileSync(path, "utf8") }))
			.filter(({ src }) => RENDERS_A_FORM.test(src) && RAW_CONTROLS.test(src))
			.map(({ path }) => path.replace(/^src\//, ""))
			.filter((path) => !FROZEN.has(path));

		expect(offenders).toEqual([]);
	});

	it("the frozen list has not gone stale", () => {
		const all = new Set(walk("src").map((p) => p.replace(/^src\//, "")));
		for (const path of FROZEN) expect(all.has(path)).toBe(true);
	});
});
