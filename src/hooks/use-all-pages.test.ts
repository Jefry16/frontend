import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { paginatedHandler } from "#/test/pagination";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAllPages } from "./use-all-pages";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/audiences";

interface Row {
	id: string;
}

const paginated = (pages: { data: Row[]; nextCursor: string | null }[]) =>
	paginatedHandler(`${API}${ENDPOINT}`, pages);

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useAllPages<Row>(["audiences", "op-1"], ENDPOINT), {
		wrapper: Wrapper,
	});
};

describe("useAllPages", () => {
	it("drains every page and flattens the rows in order", async () => {
		const { handler } = paginated([
			{ data: [{ id: "a" }, { id: "b" }], nextCursor: "c1" },
			{ data: [{ id: "c" }], nextCursor: "c2" },
			{ data: [{ id: "d" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(result.current.data?.map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
	});

	it("never reports settled while pages remain", async () => {
		const { handler } = paginated([
			{ data: [{ id: "a" }], nextCursor: "c1" },
			{ data: [{ id: "b" }], nextCursor: "c2" },
			{ data: [{ id: "c" }], nextCursor: null },
		]);
		server.use(handler);

		const renders: { pending: boolean; rows: number | null }[] = [];
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(
			() => {
				const value = useAllPages<Row>(["audiences", "op-1"], ENDPOINT);
				renders.push({
					pending: value.isPending,
					rows: value.data?.length ?? null,
				});
				return value;
			},
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isPending).toBe(false));

		const leaked = renders.filter((r) => !r.pending && r.rows !== 3);
		expect(leaked).toEqual([]);
	});

	it("url-encodes the cursor", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "a+b/c==" },
			{ data: [{ id: "b" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(cursors).toEqual([null, "a+b/c=="]);
	});

	it("keeps going well past the second page", async () => {
		server.use(
			http.get(`${API}${ENDPOINT}`, ({ request }) => {
				const cursor = new URL(request.url).searchParams.get("cursor");
				const i = cursor ? Number(cursor) : 0;
				return HttpResponse.json({
					data: [{ id: `r${i}` }],
					nextCursor: i < 5 ? String(i + 1) : null,
				});
			}),
		);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false), {
			timeout: 3000,
		});
		expect(result.current.data?.map((r) => r.id)).toEqual([
			"r0",
			"r1",
			"r2",
			"r3",
			"r4",
			"r5",
		]);
	});

	it("makes no second request when the first page is the only one", async () => {
		const calls = vi.fn();
		server.use(
			http.get(`${API}${ENDPOINT}`, () => {
				calls();
				return HttpResponse.json({ data: [{ id: "a" }], nextCursor: null });
			}),
		);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(calls).toHaveBeenCalledTimes(1);
	});

	it("never hands back a half-drained list as if it were complete", async () => {
		const { handler } = paginated([
			{ data: [{ id: "a" }], nextCursor: "c1" },
			{ data: [{ id: "b" }], nextCursor: "c2" },
			{ data: [{ id: "c" }], nextCursor: null },
		]);
		server.use(handler);
		const seen: { pending: boolean; rows: number | null }[] = [];
		const { Wrapper } = wrapperWithProviders();

		const { result } = renderHook(
			() => {
				const state = useAllPages<Row>(["audiences", "op-1"], ENDPOINT);
				seen.push({
					pending: state.isPending,
					rows: state.data?.length ?? null,
				});
				return state;
			},
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isPending).toBe(false));

		expect(seen.filter((s) => s.pending && s.rows !== null)).toEqual([]);
		expect(result.current.data?.map((r) => r.id)).toEqual(["a", "b", "c"]);
	});

	it("carries no data, and the reason, when a page fails", async () => {
		server.use(
			http.get(
				`${API}${ENDPOINT}`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);

		const { result } = render();

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.data).toBeUndefined();
		expect(result.current.error).toBeTruthy();
	});

	it("treats an empty-string cursor as the last page, not a next one", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "" },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(result.current.data?.map((r) => r.id)).toEqual(["a"]);
		expect(cursors).toEqual([null]);
	});

	it("recovers fully from a mid-drain failure once retried", async () => {
		let failOnce = true;
		server.use(
			http.get(`${API}${ENDPOINT}`, ({ request }) => {
				const cursor = new URL(request.url).searchParams.get("cursor");
				if (!cursor) {
					return HttpResponse.json({ data: [{ id: "a" }], nextCursor: "c1" });
				}
				if (failOnce) {
					failOnce = false;
					return new HttpResponse(null, { status: 500 });
				}
				return HttpResponse.json({ data: [{ id: "b" }], nextCursor: null });
			}),
		);
		const { result } = render();
		await waitFor(() => expect(result.current.isError).toBe(true));

		await act(async () => {
			result.current.refetch();
		});

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(result.current.isError).toBe(false);
		expect(result.current.data?.map((r) => r.id)).toEqual(["a", "b"]);
	});

	it("does not fetch at all until it is enabled", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: null },
		]);
		server.use(handler);
		const { Wrapper } = wrapperWithProviders();

		const { result } = renderHook(
			() =>
				useAllPages<Row>(["audiences", "op-1"], ENDPOINT, { enabled: false }),
			{ wrapper: Wrapper },
		);

		await new Promise((r) => setTimeout(r, 150));
		expect(cursors).toEqual([]);
		expect(result.current.isPending).toBe(true);
		expect(result.current.data).toBeUndefined();
	});

	it("surfaces a mid-pagination failure instead of loading forever", async () => {
		let call = 0;
		server.use(
			http.get(`${API}${ENDPOINT}`, () => {
				call += 1;
				if (call === 1) {
					return HttpResponse.json({ data: [{ id: "a" }], nextCursor: "c1" });
				}
				return new HttpResponse(null, { status: 500 });
			}),
		);

		const { result } = render();

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.isPending).toBe(false);
	});
});
