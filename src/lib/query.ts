import { isAxiosError } from "axios";

export const notFoundAwareRetry = (failureCount: number, err: unknown) => {
	if (isAxiosError(err) && err.response?.status === 404) return false;
	return failureCount < 3;
};
