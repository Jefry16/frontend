import { authApi } from "#/lib/api";

export type VerifyState = "verifying" | "success" | "error" | "missing-token";

// Verifies an email token against `GET /api/auth/verify` and maps the outcome to
// a UI state (never throws). The token is SINGLE-USE — the backend consumes it
// on the first success — so verification MUST run exactly once. This is called
// from the /auth/verify route's loader, which runs once per navigation and is
// immune to React's dev effect double-invoke (the reason an effect-based version
// double-fired and hit the already-used token).
export async function verifyToken(token?: string): Promise<VerifyState> {
	if (!token) return "missing-token";
	try {
		await authApi.get("/auth/verify", { params: { token } });
		return "success";
	} catch {
		return "error";
	}
}
