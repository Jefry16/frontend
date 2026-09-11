import type { HeaderContext } from "@tanstack/react-table";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppAsyncSetFilter } from "./AppAsyncSetFilter";

interface Row {
	name: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/members";
const KEY = ["members", "op-1"] as const;

const stubColumn = () =>
	({
		column: { getFilterValue: () => undefined, setFilterValue: () => {} },
	}) as unknown as HeaderContext<Row, unknown>;

const paginated = (
	pages: { data: Record<string, unknown>[]; nextCursor: string | null }[],
) =>
	http.get(`${API}${ENDPOINT}`, ({ request }) => {
		const cursor = new URL(request.url).searchParams.get("cursor");
		const index = cursor
			? pages.findIndex((_, i) => i > 0 && pages[i - 1]?.nextCursor === cursor)
			: 0;
		return HttpResponse.json(pages[index] ?? { data: [], nextCursor: null });
	});

describe("AppAsyncSetFilter", () => {
	it("drains every page before offering options, deduped and sorted by label", async () => {
		server.use(
			paginated([
				{ data: [{ id: "1", name: "Zoe" }], nextCursor: "c1" },
				{
					data: [
						{ id: "2", name: "Ada" },
						{ id: "1", name: "Zoe" },
					],
					nextCursor: null,
				},
			]),
		);
		renderWithProviders(
			<AppAsyncSetFilter
				headerContext={stubColumn()}
				endpoint={ENDPOINT}
				queryKey={KEY}
			/>,
		);

		await waitFor(() =>
			expect(screen.getAllByRole("checkbox")).toHaveLength(2),
		);
		const labels = screen
			.getAllByRole("checkbox")
			.map((box) => box.closest("label")?.textContent);
		expect(labels).toEqual(["Ada", "Zoe"]);
	});

	it("surfaces the failure and offers a retry rather than an empty list", async () => {
		let attempt = 0;
		server.use(
			http.get(`${API}${ENDPOINT}`, () => {
				attempt += 1;
				if (attempt === 1) return new HttpResponse(null, { status: 500 });
				return HttpResponse.json({
					data: [{ id: "1", name: "Ada" }],
					nextCursor: null,
				});
			}),
		);
		const user = userEvent.setup();
		renderWithProviders(
			<AppAsyncSetFilter
				headerContext={stubColumn()}
				endpoint={ENDPOINT}
				queryKey={KEY}
			/>,
		);

		await waitFor(() =>
			expect(screen.getByRole("button", { name: /try again/i })).toBeVisible(),
		);
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /try again/i }));

		await waitFor(() => expect(screen.getByRole("checkbox")).toBeVisible());
	});
});
