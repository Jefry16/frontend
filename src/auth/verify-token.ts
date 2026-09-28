import { isAxiosError } from "axios";
import { authApi } from "#/lib/api";

export type VerifyState =
	| "verifying"
	| "success"
	| "already-verified"
	| "expired"
	| "error"
	| "missing-token";

export async function verifyToken(token?: string): Promise<VerifyState> {
	if (!token) return "missing-token";
	try {
		await authApi.get("/auth/verify", { params: { token } });
		return "success";
	} catch (error) {
		const status = isAxiosError(error) ? error.response?.status : undefined;
		if (status === 409) return "already-verified";
		if (status === 410) return "expired";
		return "error";
	}
}
