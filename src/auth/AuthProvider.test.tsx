import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAuth } from "./AuthProvider";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => vi.fn() };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const USER = {
	id: "550e8400-e29b-41d4-a716-446655440000",
	context: "users" as const,
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const sessionClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
			mutations: { retry: false },
		},
	});

const seedOperatorData = (qc: QueryClient) => {
	qc.setQueryData(queryKeys.pages("op-1"), [{ id: "p1", title: "Secret" }]);
	qc.setQueryData(queryKeys.members("op-1"), [{ id: "m1", name: "Ada" }]);
};

describe("AuthProvider session boundaries", () => {
	it("logout empties the cache, not just the profile", async () => {
		server.use(
			http.post(
				`${API}/auth/logout`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		const qc = sessionClient();
		const { result } = renderHook(() => useAuth(), {
			wrapper: wrapperWithProviders({ queryClient: qc, user: USER }).Wrapper,
		});
		seedOperatorData(qc);

		await act(async () => {
			await result.current.logout();
		});

		expect(qc.getQueryData(queryKeys.pages("op-1"))).toBeUndefined();
		expect(qc.getQueryData(queryKeys.members("op-1"))).toBeUndefined();
		expect(qc.getQueryData(queryKeys.authProfile)).toBeUndefined();
	});

	it("login starts from an empty cache", async () => {
		server.use(
			http.post(`${API}/auth/login`, () =>
				HttpResponse.json({ accessToken: "new-token" }),
			),
			http.get(`${API}/auth/profile`, () => HttpResponse.json(USER)),
		);
		const qc = sessionClient();
		const { result } = renderHook(() => useAuth(), {
			wrapper: wrapperWithProviders({ queryClient: qc, withAuth: true })
				.Wrapper,
		});
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		seedOperatorData(qc);

		await act(async () => {
			await result.current.login("ada@example.com", "pw");
		});

		expect(qc.getQueryData(queryKeys.pages("op-1"))).toBeUndefined();
		expect(qc.getQueryData(queryKeys.authProfile)).toEqual(USER);
	});
});
