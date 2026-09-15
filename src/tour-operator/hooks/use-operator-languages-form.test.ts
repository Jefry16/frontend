import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useOperatorLanguagesForm } from "./use-operator-languages-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL = `${API}/tour-operators/${OP}`;

const LOCALES = { primaryLocale: "en", supportedLocales: ["en", "es"] };

type FieldName = "primaryLocale" | "supportedLocales";

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useOperatorLanguagesForm(OP, LOCALES), {
		wrapper: Wrapper,
	});
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

describe("useOperatorLanguagesForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("patches the locales and does not navigate away", async () => {
		const body = vi.fn();
		server.use(
			http.patch(URL, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			primaryLocale: "es",
			supportedLocales: ["en", "es"],
		});

		expect(body).toHaveBeenCalledWith({
			locales: { primaryLocale: "es", supportedLocales: ["en", "es"] },
		});
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("blocks a primary that is not in the supported set", async () => {
		const body = vi.fn();
		server.use(
			http.patch(URL, () => {
				body();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			primaryLocale: "fr",
			supportedLocales: ["en", "es"],
		});

		expect(body).not.toHaveBeenCalled();
	});

	it("blocks an empty supported set", async () => {
		const body = vi.fn();
		server.use(
			http.patch(URL, () => {
				body();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			primaryLocale: "en",
			supportedLocales: [],
		});

		expect(body).not.toHaveBeenCalled();
	});
});
