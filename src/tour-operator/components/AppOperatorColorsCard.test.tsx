import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { Brand } from "../types";
import { AppOperatorColorsCard } from "./AppOperatorColorsCard";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const PALETTE: Brand["colors"] = {
	primary: [
		{ background: "#111111", foreground: "#ffffff" },
		{ background: "#222222", foreground: "#ffffff" },
		{ background: "#333333", foreground: "#ffffff" },
	],
	secondary: [],
};

const brand = (colors: Brand["colors"]): Brand => ({
	slogan: null,
	shortDescription: null,
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	colors,
	socialLinks: [],
});

const render = (colors: Brand["colors"] = PALETTE) => {
	const body = vi.fn();
	server.use(
		http.get(URL_, () => HttpResponse.json({ brand: brand(colors) })),
		http.patch(URL_, async ({ request }) => {
			body(await request.json());
			return new HttpResponse(null, { status: 204 });
		}),
	);
	const queryClient = createTestQueryClient();
	queryClient.setQueryData(queryKeys.operatorDetails(OP), {
		brand: brand(colors),
	});
	renderWithProviders(<AppOperatorColorsCard tourOperatorId={OP} canWrite />, {
		queryClient,
	});
	return body;
};

const save = async (user: ReturnType<typeof userEvent.setup>) =>
	user.click(screen.getByRole("button", { name: /save changes/i }));

describe("AppOperatorColorsCard", () => {
	it("submits the rows in the order they read", async () => {
		const user = userEvent.setup();
		const body = render();

		await user.click(
			(await screen.findAllByRole("button", { name: /move down/i }))[0],
		);
		await save(user);

		await waitFor(() => expect(body).toHaveBeenCalled());
		expect(
			body.mock.calls[0][0].brand.colors.primary.map(
				(c: { background: string }) => c.background,
			),
		).toEqual(["#222222", "#111111", "#333333"]);
	});

	it("keeps the survivors intact when a middle row is removed", async () => {
		const user = userEvent.setup();
		const body = render();

		await user.click(
			(await screen.findAllByRole("button", { name: /^remove$/i }))[1],
		);
		await save(user);

		await waitFor(() => expect(body).toHaveBeenCalled());
		expect(body.mock.calls[0][0].brand.colors.primary).toEqual([
			{ background: "#111111", foreground: "#ffffff" },
			{ background: "#333333", foreground: "#ffffff" },
		]);
	});

	it("sends empty arrays when every colour is removed", async () => {
		const user = userEvent.setup();
		const body = render({
			primary: [{ background: "#111111", foreground: "#ffffff" }],
			secondary: [],
		});

		await user.click(
			(await screen.findAllByRole("button", { name: /^remove$/i }))[0],
		);
		await save(user);

		await waitFor(() => expect(body).toHaveBeenCalled());
		expect(body.mock.calls[0][0].brand.colors).toEqual({
			primary: [],
			secondary: [],
		});
	});
});
