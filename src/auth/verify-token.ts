import { authApi } from "#/lib/api";

export type VerifyState = "verifying" | "success" | "error" | "missing-token";

export async function verifyToken(token?: string): Promise<VerifyState> {
	if (!token) return "missing-token";
	try {
		await authApi.get("/auth/verify", { params: { token } });
		return "success";
	} catch {
		return "error";
	}
}
