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

// A form is either a literal <form> or an AppFormCard, which renders one. This
// has to name both: when the nineteen hand-rolled card shells collapsed into
// AppFormCard, matching only "<form" would have made this gate stop looking at
// precisely the files it was written for — and it would still have been green.
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
