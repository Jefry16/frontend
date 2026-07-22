import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useLoginForm } from "./use-login-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const PROFILE = {
	id: "550e8400-e29b-41d4-a716-446655440000",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const submit = async (
	email: string,
	password: string,
	form: {
		setFieldValue: (n: "email" | "password", v: string) => void;
		handleSubmit: () => Promise<void>;
	},
) => {
	act(() => {
		form.setFieldValue("email", email);
		form.setFieldValue("password", password);
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("useLoginForm", () => {
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it("on success sets no error and navigates home", async () => {
		server.use(
			http.post(`${API}/auth/login`, () =>
				HttpResponse.json({ accessToken: "at" }),
			),
			http.get(`${API}/auth/profile`, () => HttpResponse.json(PROFILE)),
		);
		const { result } = renderHook(() => useLoginForm(), {
			wrapper: wrapperWithProviders({ withAuth: true }).Wrapper,
		});

		await submit("user@example.com", "Password1!", result.current.form);

		await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: "/" }));
		expect(result.current.errorMessage).toBeNull();
	});

	it("shows invalid-credentials on 401 and does not navigate", async () => {
		server.use(
			http.post(`${API}/auth/login`, () =>
				HttpResponse.json({ message: "bad" }, { status: 401 }),
			),
		);
		const { result } = renderHook(() => useLoginForm(), {
			wrapper: wrapperWithProviders({ withAuth: true }).Wrapper,
		});

		await submit("user@example.com", "Password1!", result.current.form);

		await waitFor(() =>
			expect(result.current.errorMessage).toBe("Invalid email or password"),
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
