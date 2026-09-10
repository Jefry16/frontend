import { isNotFound } from "./api-error";

export const notFoundAwareRetry = (failureCount: number, error: unknown) =>
	!isNotFound(error) && failureCount < 3;
