import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAllPages } from "./use-all-pages";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const ENDPOINT = "/tour-operators/op-1/audiences";

interface Row {
	id: string;
}

/** Serves `pages` in order, handing back each one's cursor. */
const paginated = (pages: { data: Row[]; nextCursor: string | null }[]) => {
	const cursors: (string | null)[] = [];
	return {
		cursors,
		handler: http.get(`${API}${ENDPOINT}`, ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");
			cursors.push(cursor);
			const index = cursor
				? pages.findIndex(
						(_, i) => i > 0 && pages[i - 1]?.nextCursor === cursor,
					)
				: 0;
			return HttpResponse.json(pages[index] ?? { data: [], nextCursor: null });
		}),
	};
};

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
		expect(result.current.rows.map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
	});

	// The whole point of the hook: a consumer filtering a catalogue must never be
	// handed a partial one, or its options silently exclude real rows.
	//
	// Every render is recorded rather than polled. waitFor samples on an interval
	// and can step straight over the render that reports one page as settled —
	// which it did, and the first version of this test passed against a hook that
	// leaked the partial set.
	it("never reports settled while pages remain", async () => {
		const { handler } = paginated([
			{ data: [{ id: "a" }], nextCursor: "c1" },
			{ data: [{ id: "b" }], nextCursor: "c2" },
			{ data: [{ id: "c" }], nextCursor: null },
		]);
		server.use(handler);

		const renders: { pending: boolean; rows: number }[] = [];
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(
			() => {
				const value = useAllPages<Row>(["audiences", "op-1"], ENDPOINT);
				renders.push({
					pending: value.isPending,
					rows: value.rows.length,
				});
				return value;
			},
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isPending).toBe(false));

		const leaked = renders.filter((r) => !r.pending && r.rows !== 3);
		expect(leaked).toEqual([]);
	});

	// Cursors are opaque and routinely base64 — an unencoded `+` arrives as a
	// space and the server answers from the wrong position, silently.
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

	// The stall this hook shipped with: between page two and page three the
	// effect's dependencies hold the values they already held, so it never re-ran
	// and the list stopped at two pages while `isPending` stayed true. Six pages
	// is well past that, and past the point any hand-run check would notice.
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
		expect(result.current.rows.map((r) => r.id)).toEqual([
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

	// A failure PART WAY through is the dangerous one: rows are already in hand,
	// so a naive `isPending` reads settled and the caller renders a truncated
	// catalogue as if it were whole.
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
