import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppDataTable } from "./AppDataTable";
import { AppDataTableHeader } from "./AppDataTableHeader";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

interface Row {
	id: string;
	name: string;
}

const columns = [
	{
		id: "name",
		enableSorting: true,
		header: (ctx: never) => (
			<AppDataTableHeader label="Name" headerContext={ctx} />
		),
		cell: () => null,
	},
	{
		id: "thumbnail",
		header: () => <span>Thumbnail</span>,
		cell: () => null,
	},
	// biome-ignore lint/suspicious/noExplicitAny: a column list for one render
] as any;

const renderTable = () => {
	server.use(
		http.get(`${API}/things`, () =>
			HttpResponse.json({ data: [{ id: "1", name: "One" }], nextCursor: null }),
		),
	);
	return renderWithProviders(
		<AppDataTable<Row>
			columns={columns}
			endpoint="/things"
			queryKey={["things"]}
			emptyState={{ title: "Nothing", description: "" }}
		/>,
	);
};

describe("AppDataTable sorting semantics", () => {
	// The arrow icon in the header is decoration. Without aria-sort a screen
	// reader hears "Name, button" and learns nothing about the sort state.
	it("announces the sort state, and only on sortable columns", async () => {
		renderTable();

		const name = await screen.findByRole("columnheader", { name: /name/i });
		const thumb = screen.getByRole("columnheader", { name: /thumbnail/i });

		expect(name).toHaveAttribute("aria-sort", "none");
		expect(thumb).not.toHaveAttribute("aria-sort");

		await userEvent.click(screen.getByRole("button", { name: /name/i }));
		expect(name).toHaveAttribute("aria-sort", "ascending");

		await userEvent.click(screen.getByRole("button", { name: /name/i }));
		expect(name).toHaveAttribute("aria-sort", "descending");
	});

	it("offers a sort control only where the column enables it", async () => {
		renderTable();
		await screen.findByRole("columnheader", { name: /name/i });

		expect(screen.getByRole("button", { name: /name/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /thumbnail/i })).toBeNull();
	});
});
