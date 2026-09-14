import { screen } from "@testing-library/react";
import {
	AppDataTable,
	AppDataTableHeader,
	timestampColumn,
} from "@vointika/ui";
import { HttpResponse, http } from "msw";
import { describe, it } from "vitest";
import { expectNoA11yViolations } from "#/test/a11y";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

describe("accessibility", () => {
	it("a table announces its sort state and names each filter", async () => {
		server.use(
			http.get(`${API}/things`, () =>
				HttpResponse.json({
					data: [{ id: "1", createdAt: "2026-08-09T10:00:00Z" }],
					nextCursor: null,
				}),
			),
		);
		const { container } = renderWithProviders(
			<AppDataTable
				columns={[
					timestampColumn<{ id: string; createdAt: string }>(
						"createdAt",
						"Created",
						() => "9 Aug 2026",
					),
					{
						id: "name",
						enableSorting: true,
						// biome-ignore lint/suspicious/noExplicitAny: a column list for one render
						header: (ctx: any) => (
							<AppDataTableHeader
								label="Name"
								headerContext={ctx}
								allowFiltering="text"
							/>
						),
						cell: () => "One",
						// biome-ignore lint/suspicious/noExplicitAny: a column list for one render
					} as any,
				]}
				endpoint="/things"
				queryKey={["a11y-things"]}
				emptyState={{ title: "Nothing", description: "" }}
			/>,
		);
		await screen.findByText("9 Aug 2026");
		await expectNoA11yViolations(container);
	});
});
