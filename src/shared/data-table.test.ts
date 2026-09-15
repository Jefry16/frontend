import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { openingTagProps } from "#/test/jsx";

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

const tables = (source: string) => openingTagProps(source, "AppDataTable");

describe("every list passes an empty state", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(files.length).toBeGreaterThan(50);
		expect(
			files.filter((f) => tables(readFileSync(f, "utf8")).length > 0).length,
		).toBeGreaterThan(10);
	});

	it("every AppDataTable passes emptyState", () => {
		const offenders = files
			.filter((f) =>
				tables(readFileSync(f, "utf8")).some(
					(props) => !/\bemptyState=/.test(props),
				),
			)
			.map((f) => relative(ROOT, f));
		expect(
			offenders,
			"Every list says what an empty one means, in its own words, even the " +
				"one list that cannot be empty today: a rule with no exception is a " +
				"rule nothing slips past. Pass emptyState={{ title, description }} " +
				"to every AppDataTable.",
		).toEqual([]);
	});
});
