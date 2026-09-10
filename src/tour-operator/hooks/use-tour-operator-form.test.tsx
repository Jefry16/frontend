import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "#/auth";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useTourOperatorForm } from "./use-tour-operator-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

type FieldName =
	| "name"
	| "address.address1"
	| "address.city"
	| "timezoneId"
	| "currencyId";

const fill = (form: {
	setFieldValue: (n: FieldName, v: string) => void;
	handleSubmit: () => Promise<void>;
}) => {
	act(() => {
		form.setFieldValue("name", "Acme Tours");
		form.setFieldValue("address.address1", "1 Main St");
		form.setFieldValue("address.city", "Madrid");
		form.setFieldValue("timezoneId", "tz-1");
		form.setFieldValue("currencyId", "cur-1");
	});
	return act(async () => {
		await form.handleSubmit();
	});
};

describe("useTourOperatorForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the operator with a five-field address and no country", async () => {
		const body = vi.fn();
		server.use(
			http.post(`${API}/tour-operators`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: "/api/tour-operators/op-123" },
				});
			}),
			http.get(`${API}/auth/profile`, () => HttpResponse.json(USER)),
		);
		const { Wrapper } = wrapperWithProviders({ user: USER });
		const { result } = renderHook(() => useTourOperatorForm(), {
			wrapper: Wrapper,
		});

		await fill(result.current.form);

		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/tour-operators/$tourOperatorId",
				params: { tourOperatorId: "op-123" },
			}),
		);
		expect(result.current.errorMessage).toBeNull();
		expect(body).toHaveBeenCalledWith({
			name: "Acme Tours",
			address: {
				address1: "1 Main St",
				address2: "",
				city: "Madrid",
				province: "",
				zip: "",
			},
			timezoneId: "tz-1",
			currencyId: "cur-1",
		});
	});

	it("surfaces the server error and does not navigate", async () => {
		server.use(
			http.post(`${API}/tour-operators`, () =>
				HttpResponse.json({ message: "Name is taken" }, { status: 422 }),
			),
		);
		const { Wrapper } = wrapperWithProviders({ user: USER });
		const { result } = renderHook(() => useTourOperatorForm(), {
			wrapper: Wrapper,
		});

		await fill(result.current.form);

		await waitFor(() =>
			expect(result.current.errorMessage).toBe("Name is taken"),
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
