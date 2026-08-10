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
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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

	// The token comes from the emailed link, not from a field — it is a
	// capability, and the form never shows it.
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

	// Two different failures the operator resolves two different ways: a dead
	// link needs a new email, a rejected password needs a different password.
	// Collapsing them to one message would send people down the wrong path.
	it.each([
		[401, "expired or already-used link"],
		[422, "password rejected"],
	])("gives %i its own message (%s)", async (status) => {
		server.use(failing(status));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBeTruthy();
		expect(result.current.errorMessage).not.toBe(null);
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("tells 401 and 422 apart rather than sharing one string", async () => {
		server.use(failing(401));
		const { result: a } = render();
		await submit(a.current.form, VALID);
		const unauthorized = a.current.errorMessage;

		server.resetHandlers();
		server.use(failing(422));
		const { result: b } = render();
		await submit(b.current.form, VALID);

		expect(b.current.errorMessage).not.toBe(unauthorized);
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
