import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useForgotPasswordForm } from "./use-forgot-password-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const URL = `${API}/auth/request-password-reset`;

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useForgotPasswordForm(), { wrapper: Wrapper });
};

const submit = async (
	form: {
		setFieldValue: (n: "email", v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	email: string,
) => {
	act(() => {
		form.setFieldValue("email", email as never);
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("useForgotPasswordForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("records the submitted address on success", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 204 })));
		const { result } = render();

		await submit(result.current.form, "owner@example.com");

		expect(result.current.submittedEmail).toBe("owner@example.com");
		expect(result.current.errorMessage).toBeNull();
	});

	it("does not send a malformed address", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, () => {
				body();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, "not-an-email");

		expect(body).not.toHaveBeenCalled();
		expect(result.current.submittedEmail).toBeNull();
	});

	it("stays on the form when the request fails", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 500 })));
		const { result } = render();

		await submit(result.current.form, "owner@example.com");

		expect(result.current.submittedEmail).toBeNull();
		expect(result.current.errorMessage).toBeTruthy();
	});
});
