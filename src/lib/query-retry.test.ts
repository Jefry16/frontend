import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { notFoundAwareRetry } from "#/lib/query-retry";

const axiosError = (status: number) =>
	new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
		status,
		statusText: "",
		data: {},
		headers: new AxiosHeaders(),
		config: { headers: new AxiosHeaders() },
	});

describe("notFoundAwareRetry", () => {
	it("never retries a 404", () => {
		expect(notFoundAwareRetry(0, axiosError(404))).toBe(false);
	});

	it("retries any other failure up to the library default of 3", () => {
		const error = axiosError(500);
		expect([0, 1, 2].map((n) => notFoundAwareRetry(n, error))).toEqual([
			true,
			true,
			true,
		]);
		expect(notFoundAwareRetry(3, error)).toBe(false);
	});

	it("retries a non-axios failure (a network error has no response)", () => {
		expect(notFoundAwareRetry(0, new Error("offline"))).toBe(true);
	});
});
