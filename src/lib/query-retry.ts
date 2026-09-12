import { isAxiosError } from "axios";

const isRefusal = (error: unknown) =>
	isAxiosError(error) &&
	error.response !== undefined &&
	error.response.status < 500;

export const transientFailureRetry = (failureCount: number, error: unknown) =>
	!isRefusal(error) && failureCount < 3;
