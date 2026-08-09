import { isAxiosError } from "axios";
import * as m from "#/paraglide/messages";

// Only what we read is typed. The wire also carries `code`, which nothing
// branches on — every specific cause branches on the HTTP status instead.
interface ApiError {
	status: number;
	error: string;
	message: string;
	timestamp: string;
}

function errorBody(err: unknown): Partial<ApiError> | undefined {
	if (isAxiosError(err)) {
		return err.response?.data as Partial<ApiError> | undefined;
	}
	return undefined;
}

// Surfaces the backend's real reason ("validFrom must be today or later")
// rather than a bare "Error". Never branch on the result — it is prose.
export function apiErrorMessage(
	err: unknown,
	fallback: string = m.error(),
): string {
	const message = errorBody(err)?.message;
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

// A 404 is permanent — a missing or cross-tenant record — so callers use this
// to choose a not-found state over a retryable error.
export function isNotFound(err: unknown): boolean {
	return isAxiosError(err) && err.response?.status === 404;
}
