import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { usePageActions } from "./use-page-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const PAGE = "page-1";
const BASE = `${API}/tour-operators/${OP}/pages/${PAGE}`;

const DETAIL = ["pages", OP, PAGE];
const LIST = ["pages", OP];
const TRAIL = ["activity", OP];

describe("usePageActions", () => {
	it("publishes, then refreshes the detail, the list and the trail", async () => {
		const hit = vi.fn();
		server.use(
			http.post(`${BASE}/publish`, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current.publish.mutateAsync());

		expect(hit).toHaveBeenCalled();
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	it("unpublishes through its own endpoint, not a flag on the detail", async () => {
		const hit = vi.fn();
		server.use(
			http.post(`${BASE}/unpublish`, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current.unpublish.mutateAsync());

		expect(hit).toHaveBeenCalled();
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	it("sends the new handle on rename", async () => {
		const body = vi.fn();
		server.use(
			http.post(`${BASE}/rename`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current.rename.mutateAsync("about-us"));

		expect(body).toHaveBeenCalledWith({ handle: "about-us" });
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	// The detail is deliberately absent: the record is gone, so refetching it
	// would 404 the page the caller is navigating away from.
	it("drops only the list and the trail on delete", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([LIST, TRAIL]);
	});

	it("invalidates nothing when the request fails", async () => {
		server.use(
			http.post(
				`${BASE}/publish`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current.publish.mutateAsync());

		expect(invalidated()).toEqual([]);
	});
});
