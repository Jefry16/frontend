import { isAxiosError } from "axios";
import * as m from "#/paraglide/messages";

// The backend's standard error body (see API guide § "Error Responses"):
// { status, error, message, code?, timestamp }. `code` is a stable,
// machine-readable identifier present only on some 422/409 errors — branch on
// it (never the human-readable `message`) when a cause needs custom handling.
interface ApiError {
	status: number;
	error: string;
	message: string;
	code?: string;
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

// The stable machine-readable code, when present — for branching to a localized
// message or specific UX. Returns undefined for the common (code-less) errors.
export function apiErrorCode(err: unknown): string | undefined {
	const code = errorBody(err)?.code;
	return typeof code === "string" && code.length > 0 ? code : undefined;
}

// Whether an error is a 404 — a missing (or cross-tenant, tenant-isolated)
// resource, as opposed to a transient failure. Detail pages branch on this to
// show a "not found" state (no retry) vs an error state (with retry).
export function isNotFound(err: unknown): boolean {
	return isAxiosError(err) && err.response?.status === 404;
}
