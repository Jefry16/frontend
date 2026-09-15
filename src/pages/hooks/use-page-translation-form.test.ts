import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePageTranslationForm } from "./use-page-translation-form";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const LOCALE = "es";
const PAGE = "page-1";
const URL = `${API}/tour-operators/${OP}/pages/${PAGE}/translations/${LOCALE}`;

type FieldName = "title" | "body" | "seoTitle" | "seoDescription" | "handle";

const UNTRANSLATED: Record<string, string | null> = {
	locale: LOCALE,
	title: null,
	body: null,
	seoTitle: null,
	seoDescription: null,
	handle: null,
};

const render = (translation = UNTRANSLATED) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() =>
			usePageTranslationForm({
				tourOperatorId: OP,
				pageId: PAGE,
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

const put = (body: ReturnType<typeof vi.fn>) =>
	http.put(URL, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

describe("usePageTranslationForm", () => {
	it("sends null for an empty field, never an empty string", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, {
			title: "Sobre nosotros",
			body: "<p>Hola</p>",
			seoTitle: "   ",
			seoDescription: "",
			handle: "",
		});

		expect(body).toHaveBeenCalledWith({
			title: "Sobre nosotros",
			body: "<p>Hola</p>",
			seoTitle: null,
			seoDescription: null,
			handle: null,
		});
	});

	it("re-sends an untouched field rather than omitting it", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render({
			...UNTRANSLATED,
			title: "Sobre nosotros",
			body: "<p>Hola</p>",
		});

		await submit(result.current.form, { seoTitle: "SEO" });

		expect(body.mock.calls[0][0]).toMatchObject({
			title: "Sobre nosotros",
			body: "<p>Hola</p>",
			seoTitle: "SEO",
		});
	});

	it("clears the whole overlay with a DELETE to the same endpoint", async () => {
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

	it("rejects a localized handle that is not slug-shaped", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, {
			title: "Sobre",
			body: "<p>x</p>",
			handle: "Sobre Nosotros",
		});

		expect(body).not.toHaveBeenCalled();
	});

	it("names a handle collision rather than reporting a generic failure", async () => {
		server.use(http.put(URL, () => new HttpResponse(null, { status: 409 })));
		const { result: conflict } = render();
		await submit(conflict.current.form, { title: "Sobre", body: "<p>x</p>" });
		const taken = conflict.current.errorMessage;

		server.resetHandlers();
		server.use(http.put(URL, () => new HttpResponse(null, { status: 500 })));
		const { result: other } = render();
		await submit(other.current.form, { title: "Sobre", body: "<p>x</p>" });

		expect(taken).toBeTruthy();
		expect(other.current.errorMessage).not.toBe(taken);
	});
});
