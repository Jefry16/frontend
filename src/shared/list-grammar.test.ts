import { buildParams } from "@vointika/ui";
import { describe, expect, it } from "vitest";

describe("the list grammar the backend parses", () => {
	it("is what the package sends: sort, -field for descending, cursor, filter[field][op]", () => {
		const params = buildParams({
			cursor: "c1",
			sorting: [
				{ id: "name", desc: false },
				{ id: "created", desc: true },
			],
			filters: [
				{ id: "status", value: { operator: "in", values: ["a", "b"] } },
				{ id: "name", value: { operator: "contains", value: "kay" } },
				{ id: "empty", value: { operator: "eq", value: "" } },
			],
			baseParams: { ownerId: "op-1" },
			fieldMap: { created: { sortField: "createdAt" } },
		});

		expect(
			params.toString(),
			"backend ListQueryParser accepts sort, cursor and filter[field][op]; " +
				"a leading minus on sort means descending; an empty value is not sent",
		).toBe(
			"ownerId=op-1&cursor=c1&sort=name&sort=-createdAt" +
				"&filter%5Bstatus%5D%5Bin%5D=a%2Cb&filter%5Bname%5D%5Bcontains%5D=kay",
		);
	});
});
