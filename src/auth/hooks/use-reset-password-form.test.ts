import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useResetPasswordForm } from "./use-reset-password-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const URL = `${API}/auth/reset-password`;
const TOKEN = "reset-token-abc";

type FieldName = "password" | "confirmPassword";

const VALID: Record<FieldName, string> = {
	password: "NewPassw0rd!",
	confirmPassword: "NewPassw0rd!",
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useResetPasswordForm(TOKEN), { wrapper: Wrapper });
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

const failing = (status: number) =>
	http.post(URL, () => new HttpResponse(null, { status }));

describe("useResetPasswordForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("sends the token alongside the new password", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body).toHaveBeenCalledWith({
			token: TOKEN,
			newPassword: "NewPassw0rd!",
		});
		expect(navigateMock).toHaveBeenCalledWith({ to: "/auth/login" });
	});

	it("an unknown token is the app's own sentence, and stays on the form", async () => {
		server.use(failing(401));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBe(
			"This reset link is invalid or has expired. Request a new one.",
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("a 422 shows the backend's sentence, which names which rule the reset broke", async () => {
		server.use(
			http.post(URL, () =>
				HttpResponse.json(
					{ status: 422, message: "Password reset token has expired" },
					{ status: 422 },
				),
			),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBe(
			"Password reset token has expired",
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("blocks a mismatched confirmation before the network", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, () => {
				body();
				return new HttpResponse(null, { status: 204 });
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
