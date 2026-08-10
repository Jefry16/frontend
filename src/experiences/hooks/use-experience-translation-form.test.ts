import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useExperienceTranslationForm } from "./use-experience-translation-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const EXP = "exp-1";
const LOCALE = "es";
const URL = `${API}/tour-operators/${OP}/experiences/${EXP}/translations/${LOCALE}`;

type FieldName =
	| "name"
	| "description"
	| "longDescription"
	| "highlights"
	| "included"
	| "notIncluded"
	| "handle";

const UNTRANSLATED: Record<string, unknown> = {
	locale: LOCALE,
	name: null,
	description: null,
	longDescription: null,
	highlights: null,
	included: null,
	notIncluded: null,
	handle: null,
};

const render = (translation = UNTRANSLATED) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(
		() =>
			useExperienceTranslationForm({
				tourOperatorId: OP,
				experienceId: EXP,
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
	values: Partial<Record<FieldName, unknown>>,
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

describe("useExperienceTranslationForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("sends null for an empty field so the canonical text shows", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, {
			name: "Paseo en velero",
			description: "   ",
			handle: "",
		});

		expect(body.mock.calls[0][0]).toMatchObject({
			name: "Paseo en velero",
			description: null,
			handle: null,
		});
	});

	// An empty ARRAY is not an empty string — it goes as-is, and the backend
	// stores null so the canonical list serves the locale.
	it("sends an empty list as an array, not as null", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, {
			name: "Paseo",
			highlights: [],
			included: ["Bebidas"],
		});

		expect(body.mock.calls[0][0].highlights).toEqual([]);
		expect(body.mock.calls[0][0].included).toEqual(["Bebidas"]);
	});

	it("rejects a localized handle that is not slug-shaped", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render();

		await submit(result.current.form, {
			name: "Paseo",
			handle: "Paseo En Velero",
		});

		expect(body).not.toHaveBeenCalled();
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
