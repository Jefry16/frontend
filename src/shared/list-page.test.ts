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

const listRoutes = walk(join(ROOT, "src", "routes"))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.filter(({ source }) => /variant="list"/.test(source));

const components = new Map<string, { file: string; source: string }>();
for (const f of walk(join(ROOT, "src")).filter(
	(f) => !f.includes("/routes/"),
)) {
	const source = readFileSync(f, "utf8");
	for (const [, name] of source.matchAll(/^export const (App[A-Za-z]+)/gm))
		components.set(name, { file: relative(ROOT, f), source });
}

/** The route plus every App component it reaches, however deep. */
const closure = (route: { file: string; source: string }) => {
	const seen = new Set<string>();
	const texts = [route];
	const queue = [route.source];
	while (queue.length) {
		const text = queue.pop() as string;
		for (const [, name] of text.matchAll(/<(App[A-Za-z]+)/g)) {
			if (seen.has(name)) continue;
			seen.add(name);
			const next = components.get(name);
			if (next) {
				texts.push(next);
				queue.push(next.source);
			}
		}
	}
	return texts;
};

const headers = (source: string) => openingTagProps(source, "AppPageHeader");

describe("every list page is one shell, one header, one gated action", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(listRoutes.length).toBeGreaterThan(10);
		expect(components.size).toBeGreaterThan(50);
	});

	it("a list route has exactly one AppPageHeader, with a breadcrumb", () => {
		const offenders = listRoutes
			.filter(({ source }) => {
				const found = headers(source);
				return found.length !== 1 || !/\bbreadcrumb=/.test(found[0]);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			'A list page is AppPageShell variant="list" over one AppPageHeader ' +
				"that carries a breadcrumb; the header is where the title and the " +
				"action live, nowhere else.",
		).toEqual([]);
	});

	it("a list header's action, when there is one, is shown only to a writer", () => {
		const offenders = listRoutes
			.filter(({ source }) => {
				const actions = propExpression(headers(source)[0] ?? "", "actions");
				return actions !== undefined && !/^\s*canWrite &&/.test(actions);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			"Every create route sits behind AppWriteGate, so an action a viewer " +
				"can see is a link to a Not Permitted page. Write the header action " +
				"as actions={canWrite && <…>}, with canWrite from usePermissions().",
		).toEqual([]);
	});

	it("a list page does not hand-roll the new link, wherever on the page it sits", () => {
		const offenders = [
			...new Set(
				listRoutes
					.flatMap(closure)
					.filter(({ source }) => /<Button asChild/.test(source))
					.map(({ file }) => file),
			),
		];
		expect(
			offenders,
			"The way to a create page is AppNewLink; Button asChild around an " +
				"AppLink is the same thing written by hand, minus the next rule " +
				"someone adds to AppNewLink. AppNewLink takes a size, so a " +
				"dialog's empty state has no reason to hand-roll it either.",
		).toEqual([]);
	});
});
