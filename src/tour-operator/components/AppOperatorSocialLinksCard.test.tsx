import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { Brand } from "../types";
import { AppOperatorSocialLinksCard } from "./AppOperatorSocialLinksCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const brand = (socialLinks: Brand["socialLinks"]): Brand => ({
	slogan: null,
	shortDescription: null,
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	colors: { primary: [], secondary: [] },
	socialLinks,
});

const render = (links: Brand["socialLinks"]) => {
	const queryClient = createTestQueryClient();
	queryClient.setQueryData(queryKeys.operatorDetails(OP), {
		brand: brand(links),
	});
	return renderWithProviders(
		<AppOperatorSocialLinksCard tourOperatorId={OP} canWrite />,
		{ queryClient },
	);
};

describe("AppOperatorSocialLinksCard", () => {
	it("does not offer a platform that another row already uses", async () => {
		const user = userEvent.setup();
		render([{ platform: "INSTAGRAM", url: "https://instagram.com/acme" }]);

		await user.click(await screen.findByRole("button", { name: /add link/i }));

		const selects = screen.getAllByRole("combobox");
		expect(selects).toHaveLength(2);
		await user.click(selects[1]);

		const options = await screen.findAllByRole("option");
		const labels = options.map((o) => o.textContent);
		expect(labels).not.toContain("Instagram");
		expect(labels).toContain("Facebook");
	}, 20_000);

	it("still offers a row its own platform", async () => {
		const user = userEvent.setup();
		render([{ platform: "WHATSAPP", url: "https://wa.me/1809" }]);

		await user.click(await screen.findByRole("combobox"));

		const labels = (await screen.findAllByRole("option")).map(
			(o) => o.textContent,
		);
		expect(labels).toContain("WhatsApp");
	});

	it("disables Add once every platform is used", async () => {
		render([
			{ platform: "FACEBOOK", url: "https://facebook.com/a" },
			{ platform: "INSTAGRAM", url: "https://instagram.com/a" },
			{ platform: "TIKTOK", url: "https://tiktok.com/@a" },
			{ platform: "YOUTUBE", url: "https://youtube.com/@a" },
			{ platform: "TWITTER", url: "https://twitter.com/a" },
			{ platform: "PINTEREST", url: "https://pinterest.com/a" },
			{ platform: "TRIPADVISOR", url: "https://tripadvisor.com/a" },
			{ platform: "WHATSAPP", url: "https://wa.me/1809" },
		]);

		expect(
			await screen.findByRole("button", { name: /add link/i }),
		).toBeDisabled();
	});

	it("sends the remaining links, and the rest of the brand, on save", async () => {
		const body = vi.fn();
		server.use(
			http.get(URL_, () =>
				HttpResponse.json({
					brand: brand([
						{ platform: "FACEBOOK", url: "https://facebook.com/acme" },
						{ platform: "INSTAGRAM", url: "https://instagram.com/acme" },
					]),
				}),
			),
			http.patch(URL_, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const user = userEvent.setup();
		render([
			{ platform: "FACEBOOK", url: "https://facebook.com/acme" },
			{ platform: "INSTAGRAM", url: "https://instagram.com/acme" },
		]);

		const removes = await screen.findAllByRole("button", { name: /remove/i });
		await user.click(removes[0]);
		await user.click(screen.getByRole("button", { name: /save changes/i }));

		await waitFor(() => expect(body).toHaveBeenCalled());
		const sent = body.mock.calls[0][0];
		expect(sent.brand.socialLinks).toEqual([
			{ platform: "INSTAGRAM", url: "https://instagram.com/acme" },
		]);
	});
});
