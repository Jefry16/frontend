import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import {
	usePolicyTranslation,
	usePolicyTranslations,
} from "./use-policy-translations";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const POLICY = "policy-1";
const URL = `${API}/tour-operators/${OP}/policies/${POLICY}/translations`;

const ES = { locale: "es", title: "Política de cancelación", body: "Cuerpo" };

const listReturns = (rows: unknown[]) =>
	server.use(http.get(URL, () => HttpResponse.json(rows)));

const render = (locale: string | undefined) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() => ({
			list: usePolicyTranslations(OP, POLICY),
			overlay: usePolicyTranslation(OP, POLICY, locale),
		}),
		{ wrapper: Wrapper },
	);
};

describe("usePolicyTranslation", () => {
	it("hands back the locale's row once the list lands", async () => {
		listReturns([ES, { locale: "fr", title: "FR", body: null }]);

		const { result } = render("es");

		await waitFor(() => expect(result.current.overlay.data).toEqual(ES));
	});

	it("gives an untranslated locale an empty overlay, never undefined", async () => {
		listReturns([ES]);

		const { result } = render("fr");

		await waitFor(() =>
			expect(result.current.overlay.data).toEqual({
				locale: "fr",
				title: null,
				body: null,
			}),
		);
	});

	it("stays pending until a locale is picked, so nothing settles empty", async () => {
		listReturns([ES]);

		const { result } = render(undefined);
		await waitFor(() => expect(result.current.list.data).toBeDefined());

		expect(result.current.overlay.isPending).toBe(true);
		expect(result.current.overlay.data).toBeUndefined();
	});

	it("reports the list's failure as its own", async () => {
		server.use(http.get(URL, () => new HttpResponse(null, { status: 500 })));

		const { result } = render("es");

		await waitFor(() => expect(result.current.overlay.error).toBeTruthy());
		expect(result.current.overlay.isPending).toBe(false);
		expect(result.current.overlay.data).toBeUndefined();
	});
});
