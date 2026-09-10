import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useTranslationOverlayForm } from "./use-translation-overlay-form";

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/policies/policy-1/translations/es";
const URL = `${API}${ENDPOINT}`;

const KEYS = [
	["policies", "op-1", "policy-1", "translations"],
	["activity", "op-1"],
] as const;

const render = () =>
	renderActions(() =>
		useTranslationOverlayForm({
			endpoint: ENDPOINT,
			schema: z.object({ title: z.string() }),
			defaultValues: { title: "Hola" },
			invalidateKeys: KEYS,
		}),
	);

describe("useTranslationOverlayForm invalidation", () => {
	it("refreshes every key it was given after a save", async () => {
		server.use(http.put(URL, () => new HttpResponse(null, { status: 204 })));
		const { result, invalidated } = render();

		await fire(() => result.current.form.handleSubmit());

		expect(invalidated()).toEqual([
			["policies", "op-1", "policy-1", "translations"],
			["activity", "op-1"],
		]);
	});

	it("refreshes the same keys after clearing the locale", async () => {
		server.use(http.delete(URL, () => new HttpResponse(null, { status: 204 })));
		const { result, invalidated } = render();

		await fire(async () => result.current.clear());

		expect(invalidated()).toEqual([
			["policies", "op-1", "policy-1", "translations"],
			["activity", "op-1"],
		]);
	});

	it("invalidates nothing when the save fails", async () => {
		server.use(http.put(URL, () => new HttpResponse(null, { status: 422 })));
		const { result, invalidated } = render();

		await fire(() => result.current.form.handleSubmit());

		expect(invalidated()).toEqual([]);
	});
});
