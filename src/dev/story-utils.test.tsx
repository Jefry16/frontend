import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAllPages } from "#/hooks/use-all-pages";
import { useDataTable } from "#/shared/components/useDataTable";
import { wrapperWithProviders } from "#/test/test-utils";
import { seedAllPages, seedTable, storyQueryClient } from "./story-utils";

const KEY = ["things", "op-1"] as const;
const ENDPOINT = "/tour-operators/op-1/things";
const ROWS = [{ id: "1", name: "Sunset kayak" }];

describe("story seeds land on the key the hook reads", () => {
	it("seedTable feeds useDataTable, base params included", () => {
		const queryClient = storyQueryClient((qc) =>
			seedTable(qc, KEY, ENDPOINT, ROWS, { "filter[x][in]": "1" }),
		);
		const { result } = renderHook(
			() =>
				useDataTable({
					columns: [],
					endpoint: ENDPOINT,
					queryKey: KEY,
					baseParams: { "filter[x][in]": "1" },
				}),
			{ wrapper: wrapperWithProviders({ queryClient }).Wrapper },
		);
		expect(
			result.current.table.getRowModel().rows.map((r) => r.original),
		).toEqual(ROWS);
	});

	it("seedAllPages feeds useAllPages", () => {
		const queryClient = storyQueryClient((qc) =>
			seedAllPages(qc, KEY, ENDPOINT, ROWS),
		);
		const { result } = renderHook(() => useAllPages(KEY, ENDPOINT), {
			wrapper: wrapperWithProviders({ queryClient }).Wrapper,
		});
		expect(result.current.data).toEqual(ROWS);
	});
});
