import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePolicyTranslationForm } from "./use-policy-translation-form";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const LOCALE = "es";
const POLICY = "policy-1";
const URL = `${API}/tour-operators/${OP}/policies/${POLICY}/translations/${LOCALE}`;

type FieldName = "title" | "body";

const UNTRANSLATED: Record<string, string | null> = {
	locale: LOCALE,
	title: null,
	body: null,
};

const render = (translation = UNTRANSLATED) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() =>
			usePolicyTranslationForm({
				tourOperatorId: OP,
				policyId: POLICY,
				locale: LOCALE,
				translation: translation as never,
			}),
		{ wrapper: Wrapper },
	);
};

const submit = async (
	form: {
		setFieldValue: (n: FieldName, v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Partial<Record<FieldName, string>>,
) => {
	act(() => {
		for (const key of Object.keys(values) as FieldName[]) {
			form.setFieldValue(key, values[key] as never);
		}
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("usePolicyTranslationForm", () => {
	it("collapses an empty field to null so the canonical policy shows", async () => {
		const body = vi.fn();
		server.use(
			http.put(URL, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			title: "Cancelación",
			body: "   ",
		});

		expect(body).toHaveBeenCalledWith({ title: "Cancelación", body: null });
	});

	it("posts both fields even when only one changed", async () => {
		const body = vi.fn();
		server.use(
			http.put(URL, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render({
			...UNTRANSLATED,
			title: "Cancelación",
			body: "<p>Texto</p>",
		});

		await submit(result.current.form, { title: "Cancelaciones" });

		expect(body).toHaveBeenCalledWith({
			title: "Cancelaciones",
			body: "<p>Texto</p>",
		});
	});

	it("clears the overlay with a DELETE", async () => {
		const deleted = vi.fn();
		server.use(
			http.delete(URL, () => {
				deleted();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await act(async () => {
			result.current.clear();
		});

		expect(deleted).toHaveBeenCalled();
	});
});
