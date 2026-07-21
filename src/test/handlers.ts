import { HttpResponse, http } from "msw";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

// MSW request handlers for the test suite. `server.listen({ onUnhandledRequest:
// "error" })` (vitest.setup.ts) fails any request without a matching handler,
// so a test that hits the network must have one here or register it via
// `server.use(...)`.
//
// Default: no session. AuthProvider fires `POST /auth/refresh` on mount in every
// test that renders it — answer 401 so the bootstrap resolves to unauthenticated
// unless a test overrides it.
export const handlers = [
	http.post(`${API}/auth/refresh`, () =>
		HttpResponse.json({ message: "No session" }, { status: 401 }),
	),
];
