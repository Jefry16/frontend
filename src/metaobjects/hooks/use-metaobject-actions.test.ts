import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMetaobjectActions } from "./use-metaobject-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "entry-1";
const BASE = `${API}/tour-operators/${OP}/metaobjects/${ID}`;

const SET = [
	["metaobjects", OP, ID],
	["metaobjects", OP],
	["activity", OP],
];

describe("useMetaobjectActions", () => {
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
			useMetaobjectActions(OP, ID),
		);

		await fire(() => result.current[action].mutateAsync());

		expect(body).toHaveBeenCalledWith({ published });
		expect(invalidated()).toEqual(SET);
	});

	it("shows the backend reason when a publish is refused", async () => {
		server.use(
			http.put(`${BASE}/published`, () =>
				HttpResponse.json(
					{
						status: 403,
						error: "Forbidden",
						message: "This action requires ADMIN privileges",
					},
					{ status: 403 },
				),
			),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectActions(OP, ID),
		);

		await fire(() => result.current.publish.mutateAsync());

		expect(toastMock.error).toHaveBeenCalledWith(
			"This action requires ADMIN privileges",
		);
		expect(invalidated()).toEqual([]);
	});

	it("drops the list and the trail on delete", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([
			["metaobjects", OP],
			["activity", OP],
		]);
	});
});
