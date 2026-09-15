import { describe, expect, it } from "vitest";
import { openingTagProps } from "./jsx";

describe("openingTagProps", () => {
	it("stops at the tag's own closing bracket, not one inside a prop", () => {
		const props = openingTagProps(
			'<AppResourceView query={q} breadcrumb={<AppBreadcrumb items={[{ label: "x" }]} />} loading={<p>…</p>}>{(d) => d}</AppResourceView>',
			"AppResourceView",
		);
		expect(props).toHaveLength(1);
		expect(props[0]).toContain("loading=");
		expect(props[0]).not.toContain("</AppResourceView>");
	});

	it("does not mistake a longer tag name for the one asked for", () => {
		const props = openingTagProps(
			"<AppDataTableHeader label='x' /> <AppDataTable columns={c} />",
			"AppDataTable",
		);
		expect(props).toHaveLength(1);
		expect(props[0]).toContain("columns=");
	});
});
