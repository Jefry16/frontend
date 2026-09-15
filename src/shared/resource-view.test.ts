import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const files: string[] = [];
const walk = (dir: string) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name))
			files.push(full);
	}
};
walk(join(ROOT, "src"));

const OPEN = "<AppResourceView";

/** The props text of every <AppResourceView …> opening tag in the source. */
const resourceViews = (source: string): string[] => {
	const found: string[] = [];
	let from = source.indexOf(OPEN);
	while (from !== -1) {
		let depth = 0;
		let i = from + OPEN.length;
		for (; i < source.length; i++) {
			const c = source[i];
			if (c === "{") depth += 1;
			else if (c === "}") depth -= 1;
			else if (c === ">" && depth === 0) break;
		}
		found.push(source.slice(from + OPEN.length, i));
		from = source.indexOf(OPEN, i);
	}
	return found;
};

const withoutWayBack = (source: string) =>
	resourceViews(source).filter((props) => !/\bnotFoundAction=/.test(props));

describe("a resource page's not-found state offers a named way back", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(files.length).toBeGreaterThan(50);
		expect(
			files.filter((f) => readFileSync(f, "utf8").includes(OPEN)).length,
		).toBeGreaterThan(10);
	});

	it("the tag reader stops at the tag's own closing bracket, not one inside a prop", () => {
		const props = resourceViews(
			'<AppResourceView query={q} breadcrumb={<AppBreadcrumb items={[{ label: "x" }]} />} loading={<p>…</p>}>{(d) => d}</AppResourceView>',
		);
		expect(props).toHaveLength(1);
		expect(props[0]).toContain("loading=");
		expect(props[0]).not.toContain("</AppResourceView>");
	});

	it("every AppResourceView passes notFoundAction", () => {
		const offenders = files
			.filter((f) => withoutWayBack(readFileSync(f, "utf8")).length > 0)
			.map((f) => relative(ROOT, f));
		expect(
			offenders,
			"A record that is gone gets a link back to its list, named for the " +
				"list (m.back_to_x), not the package's generic Go back: a visitor who " +
				"arrived from a bookmark has no history to go back to. Pass " +
				"notFoundAction={backLink} to every AppResourceView.",
		).toEqual([]);
	});
});
