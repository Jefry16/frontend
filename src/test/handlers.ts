import { HttpResponse, http } from "msw";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

// An unhandled request FAILS the test (vitest.setup.ts), so every call needs a
// handler here or a `server.use(...)` override.
//
// The default is no session: AuthProvider refreshes on mount in every test that
// renders it, and the 401 is what resolves that to unauthenticated.
export const handlers = [
	http.post(`${API}/auth/refresh`, () =>
		HttpResponse.json({ message: "No session" }, { status: 401 }),
	),
];
