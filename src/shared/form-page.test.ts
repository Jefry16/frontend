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

const writeRoutes = walk(join(ROOT, "src", "routes"))
	.filter((f) => /\/(new|edit)\.tsx$|\/new\/[^/]+\.tsx$/.test(f))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.filter(({ source }) => /variant="form"/.test(source));

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

const pages = writeRoutes.map((route) => ({
	...route,
	texts: closure(route.source),
}));

const tags = (texts: string[], tag: string) =>
	texts.flatMap((text) => openingTagProps(text, tag));

describe("every create and edit page is a gated header over one form card", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(writeRoutes.length).toBeGreaterThan(15);
		expect(components.size).toBeGreaterThan(50);
	});

	it("the write gate is the first thing inside the shell", () => {
		const offenders = pages
			.filter(
				({ source }) =>
					!/<AppPageShell variant="form">\s*<AppWriteGate>/.test(source),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"A viewer who lands on a create or edit page sees Not Permitted and " +
				"nothing else: no header naming a form they cannot use, no request " +
				"for a record they cannot change. Put AppWriteGate directly inside " +
				"AppPageShell, before the header.",
		).toEqual([]);
	});

	it("a write page has exactly one AppPageHeader, with a breadcrumb", () => {
		const offenders = pages
			.filter(({ texts }) => {
				const found = tags(texts, "AppPageHeader");
				return found.length !== 1 || !/\bbreadcrumb=/.test(found[0]);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			"A create or edit page is one AppPageHeader carrying a breadcrumb; " +
				"the breadcrumb is the way back, which is why the form has no " +
				"cancel button.",
		).toEqual([]);
	});

	it("the form is an AppFormCard whose actions are AppFormActions", () => {
		const offenders = pages
			.filter(({ texts }) => {
				const cards = tags(texts, "AppFormCard");
				return (
					cards.length === 0 ||
					cards.some((card) => {
						const actions = propExpression(card, "actions");
						return actions === undefined || !/<AppFormActions\b/.test(actions);
					})
				);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			"A create or edit form is AppFormCard with actions={<AppFormActions …/>}, " +
				"in the route or in a component it renders. A raw form, a Card " +
				"around a form, or actions written by hand is the same thing minus " +
				"the next rule someone adds to the shared piece.",
		).toEqual([]);
	});

	it("no form on a write page is written by hand", () => {
		const offenders = pages
			.filter(({ texts }) => texts.some((text) => /<form[\s>]/.test(text)))
			.map(({ file }) => file);
		expect(
			offenders,
			"A page with two forms (availability's two modes) passes the card " +
				"rule with one card; this is what makes each of them an AppFormCard.",
		).toEqual([]);
	});

	it("the form's only action is submit", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppFormActions").some((props) =>
					/\bsecondary=/.test(props),
				),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"On a create or edit page the breadcrumb is the way back; a second " +
				"button beside submit is a cancel by another name.",
		).toEqual([]);
	});

	it("an edit page loads its record through AppResourceView", () => {
		const offenders = pages
			.filter(
				({ file, texts }) =>
					/\/edit\.tsx$/.test(file) &&
					tags(texts, "AppResourceView").length === 0,
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"An edit page is the create pattern inside AppResourceView, so a " +
				"missing record says so and offers the way back (resource-view gate).",
		).toEqual([]);
	});
});
