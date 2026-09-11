import { describe, expect, it, vi } from "vitest";
import { mergeQueryState, type QueryState } from "./query-state";

const pending = <T>(): QueryState<T> => ({
	data: undefined,
	isPending: true,
	error: null,
	refetch: vi.fn(),
});

const settled = <T>(data: T): QueryState<T> => ({
	data,
	isPending: false,
	error: null,
	refetch: vi.fn(),
});

const failed = <T>(error: unknown): QueryState<T> => ({
	data: undefined,
	isPending: false,
	error,
	refetch: vi.fn(),
});

const both = (a: number, b: string) => ({ a, b });

describe("mergeQueryState", () => {
	it("reports an error even while the other source is still pending", () => {
		const merged = mergeQueryState(
			failed<number>(new Error("no")),
			pending<string>(),
			both,
		);

		expect(merged.error).toBeTruthy();
		expect(merged.isPending).toBe(false);
	});

	it("surfaces an error from either side", () => {
		const fromB = mergeQueryState(
			settled(1),
			failed<string>(new Error("no")),
			both,
		);

		expect(fromB.error).toBeTruthy();
		expect(fromB.data).toBeUndefined();
	});

	it("withholds data until BOTH sources have settled", () => {
		const half = mergeQueryState(settled(1), pending<string>(), both);
		const whole = mergeQueryState(settled(1), settled("x"), both);

		expect(half.data).toBeUndefined();
		expect(half.isPending).toBe(true);
		expect(whole.data).toEqual({ a: 1, b: "x" });
	});

	it("retries both sources", () => {
		const a = settled(1);
		const b = settled("x");

		mergeQueryState(a, b, both).refetch();

		expect(a.refetch).toHaveBeenCalled();
		expect(b.refetch).toHaveBeenCalled();
	});
});
