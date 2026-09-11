import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { stubColumn } from "#/test/column";
import { paginatedHandler } from "#/test/pagination";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppAsyncSetFilter } from "./AppAsyncSetFilter";

interface Row {
	name: string;
}

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/members";
const KEY = ["members", "op-1"] as const;

const paginated = (
	pages: { data: Record<string, unknown>[]; nextCursor: string | null }[],
) => paginatedHandler(`${API}${ENDPOINT}`, pages);

const labels = () =>
	screen
		.getAllByRole("checkbox")
		.map((box) => box.closest("label")?.textContent);

describe("AppAsyncSetFilter", () => {
	it("offers the drained options deduped and sorted by label", async () => {
		const { handler } = paginated([
			{ data: [{ id: "1", name: "Zoe" }], nextCursor: "c1" },
			{
				data: [
					{ id: "2", name: "Ada" },
					{ id: "1", name: "Zoe" },
				],
				nextCursor: null,
			},
		]);
		server.use(handler);
		const { context } = stubColumn<Row>();
		renderWithProviders(
			<AppAsyncSetFilter
				headerContext={context()}
				endpoint={ENDPOINT}
				queryKey={KEY}
			/>,
		);

		await waitFor(() => expect(labels()).toEqual(["Ada", "Zoe"]));
	});

	it("writes the chosen values to the column", async () => {
		const { handler } = paginated([
			{
				data: [
					{ id: "2", name: "Ada" },
					{ id: "1", name: "Zoe" },
				],
				nextCursor: null,
			},
		]);
		server.use(handler);
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn<Row>();
		renderWithProviders(
			<AppAsyncSetFilter
				headerContext={context()}
				endpoint={ENDPOINT}
				queryKey={KEY}
			/>,
		);

		await user.click(await screen.findByRole("checkbox", { name: "Ada" }));

		expect(setFilterValue).toHaveBeenLastCalledWith({
			operator: "in",
			values: ["2"],
		});
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
		const { context } = stubColumn<Row>();
		renderWithProviders(
			<AppAsyncSetFilter
				headerContext={context()}
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
