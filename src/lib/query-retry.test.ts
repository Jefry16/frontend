import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { transientFailureRetry } from "#/lib/query-retry";

const axiosError = (status: number) =>
	new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
		status,
		statusText: "",
		data: {},
		headers: new AxiosHeaders(),
		config: { headers: new AxiosHeaders() },
	});

describe("transientFailureRetry", () => {
	it.each([
		404, 405, 409, 422,
	])("never retries a %i: the same request would be refused the same way", (status) => {
		expect(transientFailureRetry(0, axiosError(status))).toBe(false);
	});

	it("retries a server failure up to the library default of 3", () => {
		const error = axiosError(500);
		expect([0, 1, 2].map((n) => transientFailureRetry(n, error))).toEqual([
			true,
			true,
			true,
		]);
		expect(transientFailureRetry(3, error)).toBe(false);
	});

	it("retries a non-axios failure (a network error has no response)", () => {
		expect(transientFailureRetry(0, new Error("offline"))).toBe(true);
	});
});
