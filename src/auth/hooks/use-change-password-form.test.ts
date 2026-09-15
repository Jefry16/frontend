import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
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

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const URL = `${API}/auth/change-password`;

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

const VALID: Record<FieldName, string> = {
	currentPassword: "OldPassw0rd!",
	newPassword: "NewPassw0rd!",
	confirmPassword: "NewPassw0rd!",
};

const render = () => {
	const { Wrapper } = wrapperWithProviders({ withAuth: true });
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

	it("puts a rejected current password inline, and sends the attempt once", async () => {
		let attempts = 0;
		server.use(
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
		expect(attempts).toBe(1);
	});

	it("a changed password ends the session here too: the profile is gone and the login page is next", async () => {
		server.use(
			http.post(URL, () => new HttpResponse(null, { status: 204 })),
			http.post(
				`${API}/auth/logout`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		const { Wrapper, queryClient } = wrapperWithProviders({
			user: {
				id: "550e8400-e29b-41d4-a716-446655440000",
				context: "users",
				name: "Ada",
				avatarUrl: null,
				language: "en",
				tourOperators: [],
			},
		});
		const { result } = renderHook(() => useChangePasswordForm(), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, VALID);

		expect(queryClient.getQueryData(queryKeys.authProfile)).toBeUndefined();
		expect(navigateMock).toHaveBeenCalledWith({ to: "/auth/login" });
	});
});
