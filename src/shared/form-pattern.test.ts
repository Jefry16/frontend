import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The gate for COMPONENTS.md §5: a component rendering a form must not render a
// raw input control — every field goes through a renderer. If none fits, the
// answer is a new renderer in shared/, which is how AppCheckboxGroupField came
// to exist. <Label> is absent from the list on purpose: the SEO card labels an
// image dropzone, which is not a field.
const RAW_CONTROLS =
	/<(Input|Textarea|Checkbox|Select|select|input|textarea|RadioGroup|Switch)[\s/>]/;

// Must name AppFormCard as well as <form>: it renders one, and matching only
// "<form" would silently blind this gate to every file that adopts it.
const RENDERS_A_FORM = /<(form|AppFormCard)[\s>]/;

// Nothing is frozen. Every form in the app renders its fields through a
// renderer — the three row builders that used to sit here were converted once
// their rows moved into TanStack array fields.
const FROZEN = new Set<string>();

const walk = (dir: string): string[] =>
	readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return walk(path);
		return path.endsWith(".tsx") &&
			!path.includes(".stories.") &&
			!path.includes(".test.") &&
			!path.includes("/components/ui/")
			? [path]
			: [];
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
