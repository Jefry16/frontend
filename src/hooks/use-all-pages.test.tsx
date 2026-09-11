import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { paginatedHandler } from "#/test/pagination";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAllPages } from "./use-all-pages";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/audiences";
const KEY = ["audiences", "op-1"] as const;

interface Row {
	id: string;
}

const paginated = (pages: { data: Row[]; nextCursor: string | null }[]) =>
	paginatedHandler(`${API}${ENDPOINT}`, pages);

const render = (options?: { enabled?: boolean }) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useAllPages<Row>(KEY, ENDPOINT, options), {
		wrapper: Wrapper,
	});
};

const ids = (rows: Row[] | undefined) => rows?.map((r) => r.id);

describe("useAllPages", () => {
	it("drains every page and flattens the rows in order", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }, { id: "b" }], nextCursor: "c1" },
			{ data: [{ id: "c" }], nextCursor: "c2" },
			{ data: [{ id: "d" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(ids(result.current.data)).toEqual(["a", "b", "c", "d"]);
		expect(cursors).toEqual([null, "c1", "c2"]);
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
				const state = useAllPages<Row>(KEY, ENDPOINT);
				seen.push({
					pending: state.isPending,
					rows: state.data?.length ?? null,
				});
				return state;
			},
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isPending).toBe(false));

		expect(seen.filter((s) => s.rows !== null && s.rows !== 3)).toEqual([]);
		expect(ids(result.current.data)).toEqual(["a", "b", "c"]);
	});

	it("url-encodes the cursor", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "a b&c" },
			{ data: [{ id: "b" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(cursors).toEqual([null, "a b&c"]);
	});

	it("joins the cursor with & when the endpoint already carries a query", async () => {
		const urls: string[] = [];
		server.use(
			http.get(`${API}${ENDPOINT}`, ({ request }) => {
				urls.push(request.url.replace(`${API}${ENDPOINT}`, ""));
				const cursor = new URL(request.url).searchParams.get("cursor");
				return HttpResponse.json(
					cursor
						? { data: [{ id: "b" }], nextCursor: null }
						: { data: [{ id: "a" }], nextCursor: "c1" },
				);
			}),
		);
		const { Wrapper } = wrapperWithProviders();

		const { result } = renderHook(
			() => useAllPages<Row>(KEY, `${ENDPOINT}?filter[a][eq]=1`),
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(urls).toEqual(["?filter[a][eq]=1", "?filter[a][eq]=1&cursor=c1"]);
	});

	it("makes no second request when the first page is the only one", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(cursors).toEqual([null]);
	});

	it("treats an empty-string cursor as the last page, not a next one", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "" },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(ids(result.current.data)).toEqual(["a"]);
		expect(cursors).toEqual([null]);
	});

	it("stops rather than looping when a server repeats a cursor", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "c1" },
			{ data: [{ id: "b" }], nextCursor: "c1" },
		]);
		server.use(handler);

		const { result } = render();

		await waitFor(() => expect(result.current.isPending).toBe(false));
		expect(cursors).toEqual([null, "c1"]);
		expect(ids(result.current.data)).toEqual(["a", "b"]);
	});

	it("surfaces a mid-pagination failure with no data, not eternal loading", async () => {
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
		expect(result.current.data).toBeUndefined();
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
		expect(ids(result.current.data)).toEqual(["a", "b"]);
	});

	it("does not fetch at all until it is enabled", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: null },
		]);
		server.use(handler);

		const { result } = render({ enabled: false });

		await new Promise((r) => setTimeout(r, 150));
		expect(cursors).toEqual([]);
		expect(result.current.isPending).toBe(true);
		expect(result.current.data).toBeUndefined();
	});

	it("keeps two endpoints apart even when they share a key", async () => {
		const other = "/tour-operators/op-1/audiences/archived";
		server.use(
			http.get(`${API}${ENDPOINT}`, () =>
				HttpResponse.json({ data: [{ id: "live" }], nextCursor: null }),
			),
			http.get(`${API}${other}`, () =>
				HttpResponse.json({ data: [{ id: "archived" }], nextCursor: null }),
			),
		);
		const { Wrapper } = wrapperWithProviders();

		const { result } = renderHook(
			() => ({
				live: useAllPages<Row>(KEY, ENDPOINT),
				archived: useAllPages<Row>(KEY, other),
			}),
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.live.isPending).toBe(false));
		await waitFor(() => expect(result.current.archived.isPending).toBe(false));

		expect(ids(result.current.live.data)).toEqual(["live"]);
		expect(ids(result.current.archived.data)).toEqual(["archived"]);
	});

	it("does not re-drain on a remount inside its freshness window", async () => {
		const { handler, cursors } = paginated([
			{ data: [{ id: "a" }], nextCursor: "c1" },
			{ data: [{ id: "b" }], nextCursor: null },
		]);
		server.use(handler);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);

		const first = renderHook(() => useAllPages<Row>(KEY, ENDPOINT), {
			wrapper,
		});
		await waitFor(() => expect(first.result.current.isPending).toBe(false));
		expect(cursors).toHaveLength(2);
		first.unmount();

		const second = renderHook(() => useAllPages<Row>(KEY, ENDPOINT), {
			wrapper,
		});
		await waitFor(() => expect(second.result.current.isPending).toBe(false));
		await new Promise((r) => setTimeout(r, 100));

		expect(cursors).toHaveLength(2);
		expect(ids(second.result.current.data)).toEqual(["a", "b"]);
	});
});
