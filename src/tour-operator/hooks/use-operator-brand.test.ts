import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { Brand } from "../types";
import { useBrandActions, useBrandTextForm } from "./use-operator-brand";

const { refreshUser } = vi.hoisted(() => ({ refreshUser: vi.fn() }));
vi.mock("#/auth", () => ({ useAuth: () => ({ refreshUser }) }));
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}/brand`;

// A brand with every collection populated — the parts no editor in this
// release touches, and the parts a partial body would silently destroy.
const BRAND: Brand = {
	slogan: "Sail the coast",
	shortDescription: "Small-group boat tours",
	logoMediaId: "m-logo",
	squareLogoMediaId: "m-square",
	faviconMediaId: "m-fav",
	coverImageMediaId: "m-cover",
	colors: {
		primary: [{ background: "#0f172a", foreground: "#ffffff" }],
		secondary: [{ background: "#f59e0b", foreground: "#111111" }],
	},
	// Upper case, as the wire sends it — the enum's own name. A lower-cased
	// fixture round-trips fine through a spread and would have hidden the fact
	// that the platform select's values have to match `BrandSocialPlatform`.
	socialLinks: [{ platform: "INSTAGRAM", url: "https://instagram.test/acme" }],
};

const putting = (body: ReturnType<typeof vi.fn>) =>
	http.put(URL_, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

/** What the server currently holds — every write merges over THIS, not a prop. */
const serving = (brand: Brand = BRAND) =>
	http.get(URL_, () => HttpResponse.json(brand));

describe("useBrandActions", () => {
	beforeEach(() => refreshUser.mockReset());

	// `PUT /brand` is a FULL REPLACE — an absent field clears its value and an
	// absent collection empties it. So a write that changes one image still has
	// to carry the palette and the social links, or changing a logo deletes the
	// operator's colours. Nothing in the type system enforces that: a partial
	// object is a perfectly valid argument to `authApi.put`.
	it("clearing an image still sends the palette and the social links", async () => {
		const body = vi.fn();
		server.use(serving(), putting(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("logoMediaId");
		});

		expect(body).toHaveBeenCalledWith({
			...BRAND,
			logoMediaId: null,
		});
	});

	// Every field, not just the collections: the same replace semantics apply to
	// the slogan and the other three image slots.
	it("changes exactly the one slot it was asked to change", async () => {
		const body = vi.fn();
		server.use(serving(), putting(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("faviconMediaId");
		});

		const sent = body.mock.calls[0][0];
		expect(sent.faviconMediaId).toBeNull();
		expect(sent.logoMediaId).toBe("m-logo");
		expect(sent.squareLogoMediaId).toBe("m-square");
		expect(sent.coverImageMediaId).toBe("m-cover");
		expect(sent.slogan).toBe("Sail the coast");
	});

	// THE stale-write guard. Four sections of Settings → General save independently
	// against a full-replace PUT, so each has to merge over what the server holds
	// NOW — not over the copy it was rendered with. Here the palette has moved on
	// since this hook mounted (another section saved it); merging over the old one
	// would revert it, with a 204 and a screen that looks right.
	it("merges over the server's current brand, not the one it rendered with", async () => {
		const moved: Brand = {
			...BRAND,
			colors: {
				primary: [{ background: "#123456", foreground: "#ffffff" }],
				secondary: [],
			},
		};
		const body = vi.fn();
		server.use(serving(moved), putting(body));
		const { Wrapper, queryClient } = wrapperWithProviders();
		// Seeded with the OLD brand on purpose. The cache holding a stale copy is
		// the whole scenario, and it is also what makes this test bite: the client
		// here has `staleTime: Infinity`, so a `fetchQuery` that inherits it would
		// hand back this seed and never ask the server. That is why the fetch pins
		// `staleTime: 0` itself rather than trusting whoever built the client.
		queryClient.setQueryData(queryKeys.brand(OP), BRAND);
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("logoMediaId");
		});

		const sent = body.mock.calls[0][0];
		expect(sent.colors).toEqual(moved.colors);
		expect(sent.logoMediaId).toBeNull();
	});

	// The sidebar switcher reads the logo off the auth profile, not off brand,
	// so a brand write that skipped this would leave a stale logo until reload.
	it("refreshes the profile after a brand write", async () => {
		server.use(serving(), putting(vi.fn()));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("logoMediaId");
		});

		expect(refreshUser).toHaveBeenCalled();
	});
});

describe("useBrandTextForm", () => {
	beforeEach(() => refreshUser.mockReset());

	const submit = async (
		form: {
			setFieldValue: (n: "slogan" | "shortDescription", v: never) => void;
			handleSubmit: () => Promise<void>;
		},
		values: Partial<Record<"slogan" | "shortDescription", string>>,
	) => {
		act(() => {
			for (const key of Object.keys(values) as (
				| "slogan"
				| "shortDescription"
			)[]) {
				form.setFieldValue(key, values[key] as never);
			}
		});
		await act(async () => {
			await form.handleSubmit();
		});
	};

	// The text form edits two fields and must still carry the other six. This is
	// the write most likely to be "tidied" into a partial body, because a slogan
	// update sending four image ids looks redundant until you know why.
	it("sends the whole brand when only the text changed", async () => {
		const body = vi.fn();
		server.use(serving(), putting(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandTextForm(OP, BRAND), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, { slogan: "New slogan" });

		expect(body).toHaveBeenCalledWith({
			...BRAND,
			slogan: "New slogan",
		});
	});

	// Blank means "no slogan", not an empty line on the storefront.
	it("collapses a blank to null rather than sending an empty string", async () => {
		const body = vi.fn();
		server.use(serving(), putting(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandTextForm(OP, BRAND), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, { slogan: "", shortDescription: "  " });

		const sent = body.mock.calls[0][0];
		expect(sent.slogan).toBeNull();
		expect(sent.shortDescription).toBeNull();
		// …and the collections still ride along.
		expect(sent.colors).toEqual(BRAND.colors);
		expect(sent.socialLinks).toEqual(BRAND.socialLinks);
	});
});
