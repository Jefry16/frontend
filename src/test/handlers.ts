import { HttpResponse, http } from "msw";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export const handlers = [
	http.post(`${API}/auth/refresh`, () =>
		HttpResponse.json({ message: "No session" }, { status: 401 }),
	),
];
