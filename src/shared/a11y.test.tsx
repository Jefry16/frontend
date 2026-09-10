import { screen } from "@testing-library/react";
import { Languages, Pencil, Trash2 } from "lucide-react";
import { HttpResponse, http } from "msw";
import { describe, it, vi } from "vitest";
import { Card, CardContent } from "#/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppDialogFooter } from "#/shared/components/AppDialogFooter";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppSourceBlock } from "#/shared/components/AppSourceBlock";
import { timestampColumn } from "#/shared/components/table-columns";
import { expectNoA11yViolations } from "#/test/a11y";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

describe("accessibility", () => {
	it("a facts list is a real description list", async () => {
		const { container } = renderWithProviders(
			<dl>
				<AppDetailField label="Handle">/pages/about</AppDetailField>
				<AppDetailField label="Created">9 Aug 2026</AppDetailField>
			</dl>,
		);
		await expectNoA11yViolations(container);
	});

	it("a capped source block is reachable and named", async () => {
		const { container } = renderWithProviders(
			<AppSourceBlock label="Page body">{"<p>Hello</p>"}</AppSourceBlock>,
		);
		await expectNoA11yViolations(container);
	});

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

	it("a dialog footer is labelled and operable", async () => {
		const { container } = renderWithProviders(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Rename</DialogTitle>
					<AppDialogFooter onConfirm={vi.fn()} />
				</DialogContent>
			</Dialog>,
		);
		await expectNoA11yViolations(container.ownerDocument.body);
	});

	it("a page's action set is operable", async () => {
		const actions: AppAction[] = [
			{ id: "edit", label: "Edit", icon: Pencil, onSelect: vi.fn() },
			{
				id: "translations",
				label: "Translations",
				icon: Languages,
				member: true,
				onSelect: vi.fn(),
			},
			{
				id: "delete",
				label: "Delete",
				icon: Trash2,
				variant: "destructive",
				onSelect: vi.fn(),
			},
		];
		const { container } = renderWithProviders(
			<Card>
				<CardContent>
					<AppPageActions actions={actions} canWrite />
				</CardContent>
			</Card>,
		);
		await expectNoA11yViolations(container);
	});
});
