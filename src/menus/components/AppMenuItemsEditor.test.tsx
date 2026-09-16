import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { Menu } from "../types";
import { AppMenuItemsEditor } from "./AppMenuItemsEditor";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => vi.fn() };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const menu: Menu = {
	id: "menu-1",
	context: "menus",
	handle: "main-menu",
	title: "Main menu",
	items: [],
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
};

const render = () => {
	const queryClient = createTestQueryClient();
	queryClient.setQueryData(queryKeys.operatorDetails(OP), {
		locales: { primaryLocale: "en", supportedLocales: ["en"] },
	});
	server.use(
		http.get(`${API}/tour-operators/${OP}/experiences`, () =>
			HttpResponse.json({ data: [], nextCursor: null }),
		),
		http.get(`${API}/tour-operators/${OP}/pages`, () =>
			HttpResponse.json({
				data: [{ id: "p-1", title: "About", handle: "about" }],
				nextCursor: null,
			}),
		),
		http.get(`${API}/tour-operators/${OP}/categories`, () =>
			HttpResponse.json({
				data: [{ id: "c-1", name: "Water sports", handle: "water" }],
				nextCursor: null,
			}),
		),
	);
	return renderWithProviders(
		<AppMenuItemsEditor tourOperatorId={OP} menu={menu} />,
		{ queryClient },
	);
};

describe("AppMenuItemsEditor", () => {
	it("shows the target select for the link type just picked, not the one it was created with", async () => {
		const user = userEvent.setup();
		render();

		await user.click(await screen.findByRole("button", { name: /add item/i }));
		expect(screen.getAllByRole("combobox")).toHaveLength(1);

		await user.click(screen.getAllByRole("combobox")[0]);
		await user.click(await screen.findByRole("option", { name: "Page" }));

		await waitFor(() =>
			expect(screen.getAllByRole("combobox")).toHaveLength(2),
		);
		expect(
			screen.getByRole("combobox", { name: /link target/i }),
		).toBeVisible();
	});

	it("swaps the target catalogue when the link type changes from page to category", async () => {
		const user = userEvent.setup();
		render();

		await user.click(await screen.findByRole("button", { name: /add item/i }));
		await user.click(screen.getAllByRole("combobox")[0]);
		await user.click(await screen.findByRole("option", { name: "Page" }));
		await waitFor(() =>
			expect(screen.getAllByRole("combobox")).toHaveLength(2),
		);

		await user.click(screen.getAllByRole("combobox")[0]);
		await user.click(await screen.findByRole("option", { name: "Category" }));
		await waitFor(() =>
			expect(screen.getAllByRole("combobox")).toHaveLength(2),
		);

		await user.click(screen.getByRole("combobox", { name: /link target/i }));
		const options = await screen.findAllByRole("option");
		expect(options.map((o) => o.textContent)).toEqual(["Water sports"]);
	});
});

describe("AppMenuItemsEditor list drains", () => {
	it("fetches only the catalogues the rows' link types need, once each", async () => {
		const hits = { experiences: 0, pages: 0, categories: 0 };
		const queryClient = createTestQueryClient();
		queryClient.setQueryData(queryKeys.operatorDetails(OP), {
			locales: { primaryLocale: "en", supportedLocales: ["en"] },
		});
		for (const list of Object.keys(hits) as (keyof typeof hits)[]) {
			server.use(
				http.get(`${API}/tour-operators/${OP}/${list}`, () => {
					hits[list]++;
					return HttpResponse.json({ data: [], nextCursor: null });
				}),
			);
		}
		const row = (id: string, linkType: "PAGE" | "CATEGORY" | "HOME") => ({
			id,
			title: id,
			linkType,
			resourceId: null,
			url: null,
			titleTranslations: {},
			children: [],
		});
		renderWithProviders(
			<AppMenuItemsEditor
				tourOperatorId={OP}
				menu={{
					...menu,
					items: [
						row("a", "PAGE"),
						row("b", "CATEGORY"),
						row("c", "HOME"),
						row("d", "CATEGORY"),
					],
				}}
			/>,
			{ queryClient },
		);
		await waitFor(() => expect(hits.categories).toBe(1));
		await waitFor(() => expect(hits.pages).toBe(1));
		expect(hits.experiences).toBe(0);
	});
});
