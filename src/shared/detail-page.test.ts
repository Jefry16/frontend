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

/**
 * A detail page is a resource loaded through AppResourceView. The operator
 * dashboard is also `variant="detail"` but has no record to load, so it
 * never reaches AppResourceView and is excluded by that, not by a rule this
 * gate goes on to check (a scope built from the breadcrumb rule itself would
 * let a page missing its breadcrumb simply fall out of scope instead of
 * failing).
 */
const pages = walk(join(ROOT, "src", "routes"))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.filter(({ source }) => /variant="detail"/.test(source))
	.map((route) => ({ ...route, texts: closure(route.source) }))
	.filter(({ texts }) => texts.some((text) => /<AppResourceView\b/.test(text)));

const tags = (texts: string[], tag: string) =>
	texts.flatMap((text) => openingTagProps(text, tag));

describe("every detail page loads its record through AppResourceView", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(pages.length).toBeGreaterThan(14);
		expect(components.size).toBeGreaterThan(50);
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

	it("a query loads as AppDetailSkeleton, never a form skeleton or hand-rolled bars", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppResourceView").some((props) => {
					const loading = propExpression(props, "loading");
					return (
						loading !== undefined &&
						!/^<AppDetailSkeleton\b/.test(loading.trim())
					);
				}),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"AppResourceView's loading prop is <AppDetailSkeleton fields={n} />: " +
				"never AppFormSkeleton, borrowed from the write pattern, and never a " +
				"Card of hand-rolled Skeleton bars.",
		).toEqual([]);
	});

	it("no raw <pre>: long text is AppSourceBlock", () => {
		const offenders = pages
			.filter(({ texts }) => texts.some((text) => /<pre[\s>]/.test(text)))
			.map(({ file }) => file);
		expect(
			offenders,
			"A field long enough to scroll is AppSourceBlock, which names the " +
				"region for a screen reader and sizes it the same way everywhere. " +
				"Never hand-roll a scrollable <pre> block.",
		).toEqual([]);
	});
});
