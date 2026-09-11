import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const walk = (dir: string): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) return walk(full);
		return /\.tsx?$/.test(entry.name) ? [full] : [];
	});

const scannable = walk(join(ROOT, "src"))
	.map((file) => `/${relative(ROOT, file)}`)
	.filter(
		(path) =>
			!path.startsWith("/src/components/ui/") &&
			!path.startsWith("/src/paraglide/") &&
			path !== "/src/routeTree.gen.ts" &&
			!/\.test\.tsx?$/.test(path),
	);

const LITERAL_KEY =
	/\b(?:queryKey(?::\s*|=\{\s*)\[|(?:setQueryData|getQueryData|getQueryState|removeQueries)\(\s*\[)/g;

const literalKeys = (src: string) =>
	[...src.matchAll(LITERAL_KEY)].map((match) => match[0].replace(/\s+/g, ""));

describe("query keys come from one place", () => {
	it("the source walk is wired (a broken walk must not pass vacuously)", () => {
		expect(scannable.length).toBeGreaterThan(0);
	});

	it("the predicate catches an array written where a key is used", () => {
		expect(
			literalKeys(`useQuery({ queryKey: ["things", id], queryFn })`),
		).toEqual(["queryKey:["]);
		expect(
			literalKeys(`queryClient.invalidateQueries({ queryKey: [\n\t"a" ] })`),
		).toEqual(["queryKey:["]);
		expect(literalKeys(`qc.setQueryData(["things", "op-1"], rows)`)).toEqual([
			"setQueryData([",
		]);
		expect(literalKeys(`qc.setQueryData([...KEY, "es"], row)`)).toEqual([
			"setQueryData([",
		]);
		expect(
			literalKeys(
				`<AppDataTable queryKey={[...queryKeys.things(id), defId]} />`,
			),
		).toEqual(["queryKey={["]);
	});

	it("the predicate passes a key built by a helper", () => {
		expect(
			literalKeys(
				`useQuery({ queryKey: queryKeys.things(id) });
				qc.setQueryData(withLocale(KEY, "es"), row);
				queryKey: tableKey(queryKey, endpoint, sorting);
				const rows = [...data, "x"];`,
			),
		).toEqual([]);
	});

	it("no file writes a query key as an array where it is used", () => {
		const offenders = scannable
			.map((path) => ({
				path,
				hits: literalKeys(readFileSync(join(ROOT, path.slice(1)), "utf8")),
			}))
			.filter(({ hits }) => hits.length > 0)
			.map(({ path, hits }) => `${path}: ${hits.join(" ")}`);
		expect(
			offenders,
			"A query key is never written as an array at the point of use. It comes " +
				"from queryKeys in src/lib/query-keys.ts, or from a helper beside the " +
				"hook that owns the shape (allPagesKey, tableKey, withLocale). A " +
				"hand-written array is a key that invalidation and story seeds cannot " +
				"share, so one of them silently misses when the shape changes.",
		).toEqual([]);
	});
});
