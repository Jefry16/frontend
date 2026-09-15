import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { openingTagProps, propExpression } from "#/test/jsx";

const ROOT = process.cwd();
const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (/\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name))
			out.push(full);
	}
	return out;
};

/** Every file that renders a form, wherever on the page the form sits. */
const sites = walk(join(ROOT, "src"))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.map(({ file, source }) => ({
		file,
		forms: [
			...openingTagProps(source, "AppForm"),
			...openingTagProps(source, "AppFormCard"),
		],
	}))
	.filter(({ forms }) => forms.length > 0);

describe("a form reports its save failure where the form is", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(sites.length).toBeGreaterThan(25);
	});

	it("every form names its save failure beside its fields", () => {
		const offenders = sites
			.filter(({ forms }) =>
				forms.some((props) => {
					const message = propExpression(props, "errorMessage");
					return (
						message === undefined || /^(null|undefined)$/.test(message.trim())
					);
				}),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"Every AppForm and AppFormCard passes errorMessage: the reason the " +
				"last save was refused, kept by the save hook and cleared on the " +
				"next success. A toast is gone before the reader looks up; the " +
				"alert stays above the fields until they try again.",
		).toEqual([]);
	});
});
