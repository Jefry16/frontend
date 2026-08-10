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
		"publish",
		"unpublish",
	] as const)("%s refreshes the entry, the list and the trail", async (action) => {
		server.use(
			http.post(
				`${BASE}/${action}`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectActions(OP, ID),
		);

		await fire(() => result.current[action].mutateAsync());

		expect(invalidated()).toEqual(SET);
	});

	// A redundant flip 409s with a reason the operator can act on, so the
	// publish paths show it — unlike the delete below.
	it("shows the backend reason on a redundant publish", async () => {
		server.use(
			http.post(`${BASE}/publish`, () =>
				HttpResponse.json(
					{ status: 409, error: "Conflict", message: "Already published" },
					{ status: 409 },
				),
			),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectActions(OP, ID),
		);

		await fire(() => result.current.publish.mutateAsync());

		expect(toastMock.error).toHaveBeenCalledWith("Already published");
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
