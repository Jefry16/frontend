import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// COMPONENTS.md §5 is prescriptive — a form is `useForm` + the AppField
// renderers + AppFormActions — and until now nothing enforced it. Four settings
// cards had drifted to raw controls over hand-rolled `useState`, and two of
// those were written by copying a third. Every other rule here has a gate:
// depcheck for boundaries, biome for style, tsc for props. This is §5's.
//
// The rule: a component that renders a <form> must not render a raw input
// control at all — every field goes through a renderer (AppField,
// AppSelectField, AppTextareaField, AppCheckboxField, AppCheckboxGroupField,
// AppNumberField, AppDateField, AppTimeField, AppPasswordField, AppArrayInput).
// If none fits, the answer is a new renderer in shared/, not a raw control:
// that is how AppCheckboxGroupField came to exist, on the second real use.
//
// <Label> is not listed — the SEO card labels an image dropzone, which is not a
// field and has no renderer.
const RAW_CONTROLS =
	/<(Input|Textarea|Checkbox|Select|select|input|textarea|RadioGroup|Switch)[\s/>]/;

// Frozen, not endorsed. Three ROW BUILDERS: each renders a repeating row of
// cells (name + key + type, a menu item, a per-locale name) whose values live in
// plain `useState`, not in a TanStack field. The renderers all take a `field`
// and draw a label + description + error block, so none of them fits a compact
// cell. Converting these means first moving their row state into form array
// fields — a real refactor per component, not a substitution, and worth doing
// deliberately rather than as the price of closing the door on new drift.
const FROZEN = new Set([
	"menus/components/AppMenuItemsEditor.tsx",
	"metaobjects/components/AppMetaobjectDefinitionForm.tsx",
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
	it("no form renders a raw control instead of a field renderer", () => {
		const offenders = walk("src")
			.map((path) => ({ path, src: readFileSync(path, "utf8") }))
			.filter(({ src }) => src.includes("<form") && RAW_CONTROLS.test(src))
			.map(({ path }) => path.replace(/^src\//, ""))
			.filter((path) => !FROZEN.has(path));

		expect(offenders).toEqual([]);
	});

	it("the frozen list has not gone stale", () => {
		const all = new Set(walk("src").map((p) => p.replace(/^src\//, "")));
		for (const path of FROZEN) expect(all.has(path)).toBe(true);
	});
});
