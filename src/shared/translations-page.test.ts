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

const components = new Map<string, string>();
for (const f of walk(join(ROOT, "src")).filter(
	(f) => !f.includes("/routes/"),
)) {
	const source = readFileSync(f, "utf8");
	for (const [, name] of source.matchAll(/^export const (App[A-Za-z]+)/gm))
		components.set(name, source);
}

/** The route's source plus every App component it reaches, however deep. */
const closure = (source: string): string[] => {
	const seen = new Set<string>();
	const texts = [source];
	const queue = [source];
	while (queue.length) {
		const text = queue.pop() as string;
		for (const [, name] of text.matchAll(/<(App[A-Za-z]+)/g)) {
			if (seen.has(name)) continue;
			seen.add(name);
			const next = components.get(name);
			if (next) {
				texts.push(next);
				queue.push(next);
			}
		}
	}
	return texts;
};

const pages = walk(join(ROOT, "src", "routes"))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.filter(({ source }) => /variant="form"/.test(source))
	.map((route) => ({ ...route, texts: closure(route.source) }))
	.filter(({ texts }) => texts.some((text) => /<AppLocaleTabs\b/.test(text)));

const tags = (texts: string[], tag: string) =>
	texts.flatMap((text) => openingTagProps(text, tag));

describe("every translations page is an ungated locale editor a viewer can read", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(pages.length).toBeGreaterThan(4);
		expect(components.size).toBeGreaterThan(50);
	});

	it("no write gate: a viewer opens the page and reads the translations", () => {
		const offenders = pages
			.filter(
				({ texts }) =>
					texts.some((text) => /<AppWriteGate\b/.test(text)) ||
					!texts.some((text) => /<AppTranslationSummary\b/.test(text)),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"A translations page is the one write pattern a viewer may open: " +
				"they see each locale's text through AppTranslationSummary while " +
				"an editor sees the form. Never wrap it in AppWriteGate, and never " +
				"drop the summary branch.",
		).toEqual([]);
	});

	it("one header, with a breadcrumb", () => {
		const offenders = pages
			.filter(({ texts }) => {
				const headers = tags(texts, "AppPageHeader");
				return headers.length !== 1 || !/\bbreadcrumb=/.test(headers[0]);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			"Exactly one AppPageHeader reachable from the route, carrying a " +
				"breadcrumb back to the record's list.",
		).toEqual([]);
	});

	it("an operator with one language is told where to add another", () => {
		const offenders = pages
			.filter(
				({ texts }) =>
					!texts.some((text) => /<AppNoTranslatableLocales\b/.test(text)),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"With no second supported language there is nothing to translate; " +
				"render AppNoTranslatableLocales, which links to the languages " +
				"settings, instead of an empty tab list.",
		).toEqual([]);
	});

	it("every form card carries the translation notice", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppFormCard").some(
					(card) =>
						!/<AppTranslationNotice\b/.test(
							propExpression(card, "notice") ?? "",
						),
				),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"A locale form explains that an empty field falls back to the " +
				"default language: pass notice={<AppTranslationNotice />} on " +
				"every AppFormCard a translations page reaches.",
		).toEqual([]);
	});

	it("the only second button is the shared clear button", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppFormActions").some((actions) => {
					const secondary = propExpression(actions, "secondary");
					return (
						secondary !== undefined &&
						!/<AppClearTranslationButton\b/.test(secondary)
					);
				}),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"Beside Save, a translation form offers Clear and nothing else, " +
				"through AppClearTranslationButton so the label, the spinner and " +
				"the disabled state are written once.",
		).toEqual([]);
	});
});
