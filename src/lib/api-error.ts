import { isAxiosError } from "axios";
import * as m from "#/paraglide/messages";

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

export function apiErrorMessage(
	err: unknown,
	fallback: string = m.error(),
): string {
	const message = errorBody(err)?.message;
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function isNotFound(err: unknown): boolean {
	return isAxiosError(err) && err.response?.status === 404;
}
