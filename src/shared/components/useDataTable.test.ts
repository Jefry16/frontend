import { describe, expect, it } from "vitest";
import { buildParams } from "./useDataTable";

// The query string every list page sends. It had no test, which is how a
// `filterField` override survived unused: nothing pinned that a filter sends
// the column id, so removing the indirection looked risky when it was not.
const params = (over: Partial<Parameters<typeof buildParams>[0]> = {}) =>
	buildParams({
		cursor: null,
		sorting: [],
		filters: [],
		fieldMap: {},
		...over,
	}).toString();

describe("buildParams", () => {
	it("sends a filter under the column id", () => {
		expect(
			params({
				filters: [{ id: "name", value: { operator: "like", value: "ada" } }],
			}),
		).toBe("filter%5Bname%5D%5Blike%5D=ada");
	});

	it("joins a multi-value filter with commas", () => {
		expect(
			params({
				filters: [
					{ id: "role", value: { operator: "in", values: ["OWNER", "ADMIN"] } },
				],
			}),
		).toBe("filter%5Brole%5D%5Bin%5D=OWNER%2CADMIN");
	});

	it("drops empty filters rather than sending a blank one", () => {
		expect(
			params({
				filters: [
					{ id: "name", value: { operator: "like", value: "" } },
					{ id: "role", value: { operator: "in", values: [] } },
				],
			}),
		).toBe("");
	});

	// The one indirection that is real: a column whose id differs from the API's
	// sort field. `slots/columns.tsx` is the only user (experience → experienceName).
	it("maps sort through the column's sortField override", () => {
		expect(
			params({
				sorting: [{ id: "experience", desc: false }],
				fieldMap: { experience: { sortField: "experienceName" } },
			}),
		).toBe("sort=experienceName");
	});

	it("prefixes a descending sort with a minus", () => {
		expect(params({ sorting: [{ id: "startAt", desc: true }] })).toBe(
			"sort=-startAt",
		);
	});

	it("carries baseParams and the cursor", () => {
		expect(params({ cursor: "c1", baseParams: { experienceId: "e1" } })).toBe(
			"experienceId=e1&cursor=c1",
		);
	});
});
