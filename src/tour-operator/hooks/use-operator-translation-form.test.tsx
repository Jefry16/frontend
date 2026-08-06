import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { OperatorTranslation } from "../types";
import { useOperatorTranslationForm } from "./use-operator-translation-form";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ENDPOINT = `${API}/tour-operators/${OP}/translations/es`;

const translation = (
	over: Partial<OperatorTranslation> = {},
): OperatorTranslation => ({
	locale: "es",
	slogan: null,
	shortDescription: null,
	seoTitle: null,
	seoDescription: null,
	passwordMessage: null,
	...over,
});

const mount = (t: OperatorTranslation) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() =>
			useOperatorTranslationForm({
				tourOperatorId: OP,
				locale: "es",
				translation: t,
			}),
		{ wrapper: Wrapper },
	);
};

const submit = (form: { handleSubmit: () => Promise<void> }) =>
	act(async () => {
		await form.handleSubmit();
	});

describe("useOperatorTranslationForm", () => {
	it("sends all five fields — the PUT is a full replace, not a patch", async () => {
		// The guard that matters: the backend rebuilds the row from the body, so
		// a field omitted here is a field cleared in the database. Editing one
		// field must still carry the other four.
		let body: unknown;
		server.use(
			http.put(ENDPOINT, async ({ request }) => {
				body = await request.json();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = mount(
			translation({ slogan: "Vive el Caribe", seoTitle: "Acme ES" }),
		);

		act(() => result.current.form.setFieldValue("seoTitle", "Acme ES v2"));
		await submit(result.current.form);

		await waitFor(() => expect(body).toBeDefined());
		expect(body).toEqual({
			slogan: "Vive el Caribe",
			shortDescription: null,
			seoTitle: "Acme ES v2",
			seoDescription: null,
			passwordMessage: null,
		});
	});

	it("seeds empty inputs from a null overlay and sends them back as null", async () => {
		let body: unknown;
		server.use(
			http.put(ENDPOINT, async ({ request }) => {
				body = await request.json();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = mount(translation());

		expect(result.current.form.state.values).toEqual({
			slogan: "",
			shortDescription: "",
			seoTitle: "",
			seoDescription: "",
			passwordMessage: "",
		});
		await submit(result.current.form);

		await waitFor(() => expect(body).toBeDefined());
		// Empty string in the input, null on the wire — that is what makes the
		// locale fall back to canonical rather than storing a blank override.
		expect(body).toEqual({
			slogan: null,
			shortDescription: null,
			seoTitle: null,
			seoDescription: null,
			passwordMessage: null,
		});
	});

	it("surfaces the server error", async () => {
		server.use(
			http.put(ENDPOINT, () =>
				HttpResponse.json(
					{ message: "Locale 'es' is not supported by this operator" },
					{ status: 422 },
				),
			),
		);
		const { result } = mount(translation());

		await submit(result.current.form);

		await waitFor(() =>
			expect(result.current.errorMessage).toBe(
				"Locale 'es' is not supported by this operator",
			),
		);
	});

	it("clears the whole overlay with DELETE", async () => {
		let deleted = false;
		server.use(
			http.delete(ENDPOINT, () => {
				deleted = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = mount(translation({ slogan: "Vive el Caribe" }));

		act(() => result.current.clear());

		await waitFor(() => expect(deleted).toBe(true));
		expect(result.current.errorMessage).toBeNull();
	});
});
