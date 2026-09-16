import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { Brand } from "../types";
import { AppOperatorBrandCard } from "./AppOperatorBrandCard";

vi.mock("#/auth", () => ({ useAuth: () => ({ refreshUser: vi.fn() }) }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const BRAND: Brand = {
	slogan: null,
	shortDescription: null,
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	colors: { primary: [], secondary: [] },
	socialLinks: [],
};

describe("AppOperatorBrandCard", () => {
	it("shows the upload on the slot receiving it and only holds the others", async () => {
		server.use(
			http.get(URL_, () => HttpResponse.json({ brand: BRAND })),
			http.post(`${URL_}/media`, async () => {
				await delay("infinite");
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const queryClient = createTestQueryClient();
		queryClient.setQueryData(queryKeys.operatorDetails(OP), { brand: BRAND });
		const { container } = renderWithProviders(
			<AppOperatorBrandCard tourOperatorId={OP} canWrite />,
			{ queryClient },
		);
		const inputs =
			container.querySelectorAll<HTMLInputElement>("input[type=file]");
		expect(inputs).toHaveLength(4);

		await userEvent
			.setup()
			.upload(
				inputs[1],
				new File(["png"], "square.png", { type: "image/png" }),
			);

		const spinner = await screen.findByRole("status", { name: "Loading" });
		expect(screen.getAllByRole("status", { name: "Loading" })).toHaveLength(1);
		expect(inputs[1].parentElement).toContainElement(spinner);
		for (const input of inputs) expect(input).toBeDisabled();
	});
});
