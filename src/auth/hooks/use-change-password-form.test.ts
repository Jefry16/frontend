import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useChangePasswordForm } from "./use-change-password-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const URL = `${API}/auth/change-password`;

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

const VALID: Record<FieldName, string> = {
	currentPassword: "OldPassw0rd!",
	newPassword: "NewPassw0rd!",
	confirmPassword: "NewPassw0rd!",
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useChangePasswordForm(), { wrapper: Wrapper });
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

describe("useChangePasswordForm", () => {
	beforeEach(() => navigateMock.mockReset());

	// The confirmation exists to catch a typo, not to be stored. Sending it would
	// put a third copy of the password on the wire for nothing.
	it("sends current and new, never the confirmation", async () => {
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
			currentPassword: "OldPassw0rd!",
			newPassword: "NewPassw0rd!",
		});
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

	// The backend rejects it too; catching it here keeps the operator from
	// spending a round trip to be told what the form already knew.
	it("blocks reusing the current password", async () => {
		const body = vi.fn();
		server.use(
			http.post(URL, () => {
				body();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			currentPassword: "OldPassw0rd!",
			newPassword: "OldPassw0rd!",
			confirmPassword: "OldPassw0rd!",
		});

		expect(body).not.toHaveBeenCalled();
	});

	// A wrong current password is something the operator can act on, so the
	// reason belongs inline beside the field rather than in a toast.
	//
	// The refresh handler is not decoration. `/auth/change-password` is absent
	// from SKIP_AUTH_URLS, so its 401 — which means "wrong password", not
	// "expired session" — sends the interceptor off to refresh and retry before
	// the message can surface. Without a session here the test would assert on
	// the refresh's failure instead of the backend's reason.
	it("puts a rejected current password inline", async () => {
		let attempts = 0;
		server.use(
			http.post(`${API}/auth/refresh`, () =>
				HttpResponse.json({ accessToken: "fresh" }),
			),
			http.post(URL, () => {
				attempts += 1;
				return HttpResponse.json(
					{
						status: 401,
						error: "Unauthorized",
						message: "Current password is incorrect",
					},
					{ status: 401 },
				);
			}),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBe("Current password is incorrect");
		// Twice, not once: the pointless refresh-and-retry described above.
		expect(attempts).toBe(2);
	});
});
