import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { Brand } from "../types";
import { AppOperatorSocialLinksCard } from "./AppOperatorSocialLinksCard";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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
	// The table's key is (operator, platform) and a repeat is a 422. Filtering the
	// options is what turns that into something the operator cannot do, rather
	// than something they get told off for after a round trip.
	//
	// The explicit timeout is not a slow assertion, it is a slow test: two real
	// pointer interactions, each opening a portalled listbox, and jsdom does that
	// unhurriedly. Alone it takes ~300ms; sharing a machine with the rest of the
	// suite it has overrun the 5s default in about half of local runs while
	// passing every time in CI. The default stays low everywhere else on purpose,
	// so that a genuine hang fails in seconds instead of costing the job.
	it("does not offer a platform that another row already uses", async () => {
		const user = userEvent.setup();
		render([{ platform: "INSTAGRAM", url: "https://instagram.com/acme" }]);

		await user.click(await screen.findByRole("button", { name: /add link/i }));

		// Two rows now. The second one's select must not offer Instagram.
		const selects = screen.getAllByRole("combobox");
		expect(selects).toHaveLength(2);
		await user.click(selects[1]);

		const options = await screen.findAllByRole("option");
		const labels = options.map((o) => o.textContent);
		expect(labels).not.toContain("Instagram");
		expect(labels).toContain("Facebook");
	}, 20_000);

	// The row's own pick has to stay in its list, or reopening the select on a
	// saved row shows it as unavailable and the value looks invalid.
	it("still offers a row its own platform", async () => {
		const user = userEvent.setup();
		render([{ platform: "WHATSAPP", url: "https://wa.me/1809" }]);

		await user.click(await screen.findByRole("combobox"));

		const labels = (await screen.findAllByRole("option")).map(
			(o) => o.textContent,
		);
		expect(labels).toContain("WhatsApp");
	});

	// Eight platforms, eight rows — a ninth could only duplicate one.
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

	// PUT /brand is a full replace, so removing a row has to send the survivors —
	// and the parts this card does not edit have to ride along untouched.
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
