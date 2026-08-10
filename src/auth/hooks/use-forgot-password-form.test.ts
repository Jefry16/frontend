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

	// `submittedEmail` is what flips the screen to "check your inbox", and it
	// carries the address back so the confirmation can name it.
	it("records the submitted address on success", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 204 })));
		const { result } = render();

		await submit(result.current.form, "owner@example.com");

		expect(result.current.submittedEmail).toBe("owner@example.com");
		expect(result.current.errorMessage).toBeNull();
	});

	// Anti-enumeration: the endpoint 204s whether or not the address exists, so
	// the confirmation must look identical either way. A test that asserted a
	// different outcome for an unknown address would be asserting a leak.
	it("confirms identically for an address that is not registered", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 204 })));
		const { result } = render();

		await submit(result.current.form, "nobody@example.com");

		expect(result.current.submittedEmail).toBe("nobody@example.com");
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

	// A real failure must NOT flip to the confirmation — that would tell the
	// operator a mail is coming when none was queued.
	it("stays on the form when the request fails", async () => {
		server.use(http.post(URL, () => new HttpResponse(null, { status: 500 })));
		const { result } = render();

		await submit(result.current.form, "owner@example.com");

		expect(result.current.submittedEmail).toBeNull();
		expect(result.current.errorMessage).toBeTruthy();
	});
});
