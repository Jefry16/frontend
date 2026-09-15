import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { usePageActions } from "./use-page-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const PAGE = "page-1";
const BASE = `${API}/tour-operators/${OP}/pages/${PAGE}`;

const DETAIL = ["pages", OP, PAGE];
const LIST = ["pages", OP];
const TRAIL = ["activity", OP];

describe("usePageActions", () => {
	it.each([
		["publish", true],
		["unpublish", false],
	] as const)("%s PUTs the flag to the published sub-resource, then refreshes", async (action, published) => {
		const body = vi.fn();
		server.use(
			http.put(`${BASE}/published`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePageActions(OP, PAGE),
		);

		await fire(() => result.current[action].mutateAsync());

		expect(body).toHaveBeenCalledWith({ published });
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
			http.put(
				`${BASE}/published`,
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
