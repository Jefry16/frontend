import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// COMPONENTS.md §5 is prescriptive — a form is `useForm` + the AppField
// renderers + AppFormActions — and until now nothing enforced it. Four settings
// cards had drifted to raw controls over hand-rolled `useState`, and two of
// those were written by copying a third. Every other rule here has a gate:
// depcheck for boundaries, biome for style, tsc for props. This is §5's.
//
// The rule: a component rendering a <form> with raw input controls and NO
// `form.Field` is hand-rolling a form. A §5 form that *also* holds a dynamic
// control is fine — a checkbox per weekday or per locale has no single named
// field to hang a renderer on. <Label> is not listed either: the SEO card
// labels an image dropzone, which is not a field.
const RAW_CONTROLS = /<(Input|Textarea|Checkbox|select|input|textarea)[\s/>]/;

// Frozen, not endorsed. Both predate the gate and neither maps onto one
// `useForm`, so converting them is its own change rather than a condition of
// closing the door on new ones.
const FROZEN = new Set([
	// A nested add/remove/reorder tree, not a flat field set.
	"menus/components/AppMenuItemsEditor.tsx",
	// One field per locale with its own save/clear per row; §5 names it as part
	// of the translation-editor shape rather than the standard form skeleton.
	"shared/components/AppNameTranslations.tsx",
]);

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
	it("no new component hand-rolls a form out of raw controls", () => {
		const offenders = walk("src")
			.map((path) => ({ path, src: readFileSync(path, "utf8") }))
			.filter(
				({ src }) =>
					src.includes("<form") &&
					RAW_CONTROLS.test(src) &&
					!src.includes("form.Field"),
			)
			.map(({ path }) => path.replace(/^src\//, ""))
			.filter((path) => !FROZEN.has(path));

		expect(offenders).toEqual([]);
	});

	it("the frozen list has not gone stale", () => {
		const all = new Set(walk("src").map((p) => p.replace(/^src\//, "")));
		for (const path of FROZEN) expect(all.has(path)).toBe(true);
	});
});
