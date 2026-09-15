import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useRegisterForm } from "./use-register-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const URL = `${API}/auth/register`;

type FieldName = "name" | "email" | "password" | "confirmPassword";

const VALID: Record<FieldName, string> = {
	name: "  Ada Lovelace  ",
	email: "ada@example.com",
	password: "Passw0rd!23",
	confirmPassword: "Passw0rd!23",
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useRegisterForm(), { wrapper: Wrapper });
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

describe("useRegisterForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("strips the confirmation, trims the name, and carries the UI language", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body).toHaveBeenCalledWith({
			name: "Ada Lovelace",
			email: "ada@example.com",
			password: "Passw0rd!23",
			language: "en",
		});
	});

	it("lands on verify-email carrying the address", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 201 })));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/auth/verify-email",
			search: { email: "ada@example.com" },
		});
	});

	it("blocks a mismatched confirmation before the network", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, () => {
				body();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			...VALID,
			confirmPassword: "Different1!",
		});

		expect(body).not.toHaveBeenCalled();
	});
});
