import { describe, expect, it } from "vitest";
import { openingTagProps, propExpression } from "./jsx";

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

describe("propExpression", () => {
	it("returns the braces' content, whole, even with nested braces", () => {
		const props =
			" title={m.x()} actions={canWrite && (<A params={{ id }}>{m.y()}</A>)} />";
		expect(propExpression(props, "actions")).toBe(
			"canWrite && (<A params={{ id }}>{m.y()}</A>)",
		);
	});

	it("is undefined for a prop that is not passed", () => {
		expect(propExpression(" title={m.x()}", "actions")).toBeUndefined();
	});
});
