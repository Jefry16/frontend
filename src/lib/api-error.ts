import { isAxiosError } from "axios";
import * as m from "#/paraglide/messages";

// The backend's standard error body (see API guide § "Error Responses"):
// { status, error, message, code?, timestamp }. Only what we read is typed —
// `code` is on the wire but nothing branches on it (the twelve sites that need
// a specific cause branch on the HTTP status), so adding it back is a
// deliberate act rather than a field carried because the payload has one.
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

// The user-facing message for a failed action: the backend's `message` if it
// sent one, otherwise a generic fallback. This is what surfaces in form alerts
// and action toasts so the operator sees the real reason (e.g. "validFrom must
// be today or later") instead of a bare "Error".
export function apiErrorMessage(
	err: unknown,
	fallback: string = m.error(),
): string {
	const message = errorBody(err)?.message;
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

// Whether an error is a 404 — a missing (or cross-tenant, tenant-isolated)
// resource, as opposed to a transient failure. Detail pages branch on this to
// show a "not found" state (no retry) vs an error state (with retry).
export function isNotFound(err: unknown): boolean {
	return isAxiosError(err) && err.response?.status === 404;
}
