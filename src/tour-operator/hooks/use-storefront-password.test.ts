import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { StorefrontPasswordSettings } from "../types";
import { useStorefrontPasswordForm } from "./use-storefront-password";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const STORED: StorefrontPasswordSettings = {
	enabled: true,
	password: "sunset2026",
	message: "Launching soon",
};

const patching = (body: ReturnType<typeof vi.fn>) =>
	http.patch(URL_, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

const submit = async (
	form: {
		setFieldValue: (n: never, v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Record<string, unknown>,
) => {
	act(() => {
		for (const [k, v] of Object.entries(values))
			form.setFieldValue(k as never, v as never);
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("useStorefrontPasswordForm", () => {
	// `enabled` is REQUIRED: the backend 422s without it. That is the rule that
	// stops a storefront being opened to the public by an accidentally empty
	// body, so it has to be in every request, including one that only edits the
	// message.
	it("always names enabled, and sends one section", async () => {
		const body = vi.fn();
		server.use(patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useStorefrontPasswordForm(OP, STORED), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, { message: "Back in August" });

		expect(body).toHaveBeenCalledWith({
			storefrontPassword: {
				enabled: true,
				password: "sunset2026",
				message: "Back in August",
			},
		});
	});

	// A blank password KEEPS the stored one rather than clearing it. So leaving
	// the box empty while the gate is on is a legitimate save, not a lockout —
	// and sending "" instead of null would be too, which is why the null matters
	// rather than the emptiness.
	it("sends null for a blank password, which keeps the stored one", async () => {
		const body = vi.fn();
		server.use(patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(
			() => useStorefrontPasswordForm(OP, { ...STORED, password: null }),
			{ wrapper: Wrapper },
		);

		await submit(result.current.form, { enabled: false, message: "" });

		expect(body).toHaveBeenCalledWith({
			storefrontPassword: { enabled: false, password: null, message: null },
		});
	});
});
