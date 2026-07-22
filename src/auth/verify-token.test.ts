import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { verifyToken } from "./verify-token";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

describe("verifyToken", () => {
	it("returns 'missing-token' when no token is given", async () => {
		expect(await verifyToken(undefined)).toBe("missing-token");
	});

	it("returns 'success' on a 204", async () => {
		server.use(
			http.get(
				`${API}/auth/verify`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		expect(await verifyToken("good-token")).toBe("success");
	});

	it("returns 'error' on an invalid/expired token", async () => {
		server.use(
			http.get(`${API}/auth/verify`, () =>
				HttpResponse.json({ message: "expired" }, { status: 422 }),
			),
		);
		expect(await verifyToken("bad-token")).toBe("error");
	});
});
