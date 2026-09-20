import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { Metaobject } from "../types";
import { translatableFields } from "../validators/metaobject-translation";
import { useMetaobjectTranslationForm } from "./use-metaobject-translation-form";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const LOCALE = "es";
const ENTRY_ID = "entry-1";
const URL = `${API}/tour-operators/${OP}/metaobjects/${ENTRY_ID}/field-translations/${LOCALE}`;

const ENTRY = {
	id: ENTRY_ID,
	fields: [
		{ key: "title", type: "single_line_text", name: "Title", value: "Hello" },
		{ key: "bio", type: "multi_line_text", name: "Bio", value: "A guide" },
		{ key: "tagline", type: "single_line_text", name: "Tagline", value: null },
		{ key: "age", type: "number_integer", name: "Age", value: "40" },
	],
} as Metaobject;

const render = (translation: Record<string, string> = {}) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() =>
			useMetaobjectTranslationForm({
				tourOperatorId: OP,
				metaobjectId: ENTRY_ID,
				locale: LOCALE,
				fields: translatableFields(ENTRY),
				translation,
			}),
		{ wrapper: Wrapper },
	);
};

const submit = async (
	form: {
		setFieldValue: (n: string, v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Record<string, string>,
) => {
	act(() => {
		for (const [key, value] of Object.entries(values)) {
			form.setFieldValue(key, value as never);
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

describe("useMetaobjectTranslationForm", () => {
	it("offers only text fields that have a value", () => {
		expect(translatableFields(ENTRY).map((f) => f.key)).toEqual([
			"title",
			"bio",
		]);
	});

	it("wraps the fields in `values` and sends a blank to clear one", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render({ title: "Hola", bio: "Una guía" });

		await submit(result.current.form, { bio: "   " });

		await waitFor(() => expect(body).toHaveBeenCalled());
		expect(body).toHaveBeenCalledWith({
			values: { title: "Hola", bio: "" },
		});
	});

	it("rejects a single-line value over the backend's 255", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, { title: "x".repeat(256) });

		expect(body).not.toHaveBeenCalled();
	});

	it("clears the whole overlay with a DELETE to the same endpoint", async () => {
		const deleted = vi.fn();
		server.use(
			http.delete(URL, () => {
				deleted();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render({ title: "Hola" });

		await act(async () => {
			result.current.clear();
		});

		await waitFor(() => expect(deleted).toHaveBeenCalled());
	});
});
