import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { authApi, setOnAuthExpired } from "./api";
import { getAccessToken, setAccessToken } from "./tokens";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

/** 401s the first `failures` calls, then 200s — how an expired token behaves. */
const expiring = (path: string, failures: number, onCall?: () => void) => {
	let seen = 0;
	return http.get(`${API}${path}`, ({ request }) => {
		onCall?.();
		seen += 1;
		if (seen <= failures) return new HttpResponse(null, { status: 401 });
		return HttpResponse.json({
			authorization: request.headers.get("authorization"),
		});
	});
};

const refreshHandler = (token: string, onCall?: () => void) =>
	http.post(`${API}/auth/refresh`, () => {
		onCall?.();
		return HttpResponse.json({ accessToken: token });
	});

describe("authApi request interceptor", () => {
	it("attaches the in-memory token", async () => {
		setAccessToken("tok-1");
		server.use(
			http.get(`${API}/thing`, ({ request }) =>
				HttpResponse.json({
					authorization: request.headers.get("authorization"),
				}),
			),
		);

		const { data } = await authApi.get("/thing");

		expect(data.authorization).toBe("Bearer tok-1");
	});

	// The auth endpoints are reached while signed out, and /auth/refresh must not
	// send the very token it exists to replace.
	it("sends no Authorization header to an auth endpoint", async () => {
		setAccessToken("tok-1");
		server.use(
			http.post(`${API}/auth/login`, ({ request }) =>
				HttpResponse.json({
					authorization: request.headers.get("authorization"),
				}),
			),
		);

		const { data } = await authApi.post("/auth/login");

		expect(data.authorization).toBeNull();
	});
});

describe("authApi 401 handling", () => {
	it("refreshes once and retries the original request with the new token", async () => {
		setAccessToken("stale");
		const refreshed = vi.fn();
		server.use(expiring("/thing", 1), refreshHandler("fresh", refreshed));

		const { data } = await authApi.get("/thing");

		expect(refreshed).toHaveBeenCalledTimes(1);
		expect(data.authorization).toBe("Bearer fresh");
		expect(getAccessToken()).toBe("fresh");
	});

	// THE loop guard. Without `_retry` the interceptor goes round forever against
	// a 401 that never becomes anything else. The endpoint relents on the 6th call
	// so a broken guard fails this loudly instead of hanging the run.
	it("gives up after one retry when the 401 repeats", async () => {
		setAccessToken("stale");
		const calls = vi.fn();
		const refreshed = vi.fn();
		server.use(
			expiring("/thing", 5, calls),
			refreshHandler("fresh", refreshed),
		);

		await expect(authApi.get("/thing")).rejects.toMatchObject({
			response: { status: 401 },
		});

		expect(calls).toHaveBeenCalledTimes(2);
		expect(refreshed).toHaveBeenCalledTimes(1);
	});

	// Refresh sessions ROTATE, so a second concurrent refresh invalidates the
	// first. Without the in-flight promise every parallel 401 starts its own,
	// and the surviving token is whichever landed last — the rest of the tab's
	// requests then fail against a token the server has already retired.
	it("refreshes ONCE for many simultaneous 401s", async () => {
		setAccessToken("stale");
		const refreshed = vi.fn();
		server.use(
			expiring("/a", 1),
			expiring("/b", 1),
			expiring("/c", 1),
			refreshHandler("fresh", refreshed),
		);

		const results = await Promise.all([
			authApi.get("/a"),
			authApi.get("/b"),
			authApi.get("/c"),
		]);

		expect(refreshed).toHaveBeenCalledTimes(1);
		for (const r of results) {
			expect(r.data.authorization).toBe("Bearer fresh");
		}
	});

	// A 401 from /auth/login means "wrong password", not "expired session". A
	// refresh here would answer the form's error with a redirect to login.
	it("does not refresh when an auth endpoint itself 401s", async () => {
		const refreshed = vi.fn();
		server.use(
			http.post(
				`${API}/auth/login`,
				() => new HttpResponse(null, { status: 401 }),
			),
			refreshHandler("fresh", refreshed),
		);

		await expect(authApi.post("/auth/login")).rejects.toMatchObject({
			response: { status: 401 },
		});

		expect(refreshed).not.toHaveBeenCalled();
	});

	it("leaves any other status alone", async () => {
		setAccessToken("tok-1");
		const refreshed = vi.fn();
		server.use(
			http.get(`${API}/thing`, () => new HttpResponse(null, { status: 500 })),
			refreshHandler("fresh", refreshed),
		);

		await expect(authApi.get("/thing")).rejects.toMatchObject({
			response: { status: 500 },
		});

		expect(refreshed).not.toHaveBeenCalled();
		expect(getAccessToken()).toBe("tok-1");
	});

	// The session is genuinely gone. Dropping the token is what stops the next
	// request retrying against it; the callback is what routes to login.
	it("clears the token and calls the expiry hook when the refresh fails", async () => {
		setAccessToken("stale");
		const expired = vi.fn();
		setOnAuthExpired(expired);
		server.use(
			expiring("/thing", 5),
			http.post(
				`${API}/auth/refresh`,
				() => new HttpResponse(null, { status: 401 }),
			),
		);

		await expect(authApi.get("/thing")).rejects.toBeDefined();

		expect(getAccessToken()).toBeNull();
		expect(expired).toHaveBeenCalledTimes(1);
	});
});
