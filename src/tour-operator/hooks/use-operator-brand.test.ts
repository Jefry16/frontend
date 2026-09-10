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
const URL_ = `${API}/tour-operators/${OP}`;

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
	socialLinks: [{ platform: "INSTAGRAM", url: "https://instagram.test/acme" }],
};

const patching = (body: ReturnType<typeof vi.fn>) =>
	http.patch(URL_, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

const serving = (brand: Brand = BRAND) =>
	http.get(URL_, () =>
		HttpResponse.json({
			id: OP,
			context: "tour-operators",
			name: "Acme Tours",
			handle: "acme-tours",
			brand,
			seo: { seoTitle: "Keep me", seoDescription: null, ogImageMediaId: null },
			locales: { primaryLocale: "en", supportedLocales: ["en"] },
			storefrontPassword: { enabled: true, password: "hunter2", message: null },
		}),
	);

describe("useBrandActions", () => {
	beforeEach(() => refreshUser.mockReset());

	it("clearing an image still sends the palette and the social links", async () => {
		const body = vi.fn();
		server.use(serving(), patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("logoMediaId");
		});

		expect(body).toHaveBeenCalledWith({
			brand: { ...BRAND, logoMediaId: null },
		});
	});

	it("changes exactly the one slot it was asked to change", async () => {
		const body = vi.fn();
		server.use(serving(), patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("faviconMediaId");
		});

		const sent = body.mock.calls[0][0];
		expect(Object.keys(sent)).toEqual(["brand"]);
		expect(sent.brand.faviconMediaId).toBeNull();
		expect(sent.brand.logoMediaId).toBe("m-logo");
		expect(sent.brand.squareLogoMediaId).toBe("m-square");
		expect(sent.brand.coverImageMediaId).toBe("m-cover");
		expect(sent.brand.slogan).toBe("Sail the coast");
	});

	it("merges over the server's current brand, not the one it rendered with", async () => {
		const moved: Brand = {
			...BRAND,
			colors: {
				primary: [{ background: "#123456", foreground: "#ffffff" }],
				secondary: [],
			},
		};
		const body = vi.fn();
		server.use(serving(moved), patching(body));
		const { Wrapper, queryClient } = wrapperWithProviders();
		queryClient.setQueryData(queryKeys.operatorDetails(OP), { brand: BRAND });
		const { result } = renderHook(() => useBrandActions(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.clearImage.mutateAsync("logoMediaId");
		});

		const sent = body.mock.calls[0][0];
		expect(sent.brand.colors).toEqual(moved.colors);
		expect(sent.brand.logoMediaId).toBeNull();
	});

	it("refreshes the profile after a brand write", async () => {
		server.use(serving(), patching(vi.fn()));
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

	it("sends the whole brand when only the text changed", async () => {
		const body = vi.fn();
		server.use(serving(), patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandTextForm(OP, BRAND), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, { slogan: "New slogan" });

		expect(body).toHaveBeenCalledWith({
			brand: { ...BRAND, slogan: "New slogan" },
		});
	});

	it("collapses a blank to null rather than sending an empty string", async () => {
		const body = vi.fn();
		server.use(serving(), patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useBrandTextForm(OP, BRAND), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, { slogan: "", shortDescription: "  " });

		const sent = body.mock.calls[0][0];
		expect(sent.brand.slogan).toBeNull();
		expect(sent.brand.shortDescription).toBeNull();
		expect(sent.brand.colors).toEqual(BRAND.colors);
		expect(sent.brand.socialLinks).toEqual(BRAND.socialLinks);
	});
});
