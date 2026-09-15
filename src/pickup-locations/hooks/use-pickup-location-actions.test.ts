import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { usePickupLocationActions } from "./use-pickup-location-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "pickup-1";
const BASE = `${API}/tour-operators/${OP}/pickup-locations/${ID}`;

describe("usePickupLocationActions", () => {
	it("deletes, then refreshes the list and the trail", async () => {
		const hit = vi.fn();
		server.use(
			http.delete(BASE, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePickupLocationActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(hit).toHaveBeenCalled();
		expect(invalidated()).toEqual([
			["pickup-locations", OP],
			["activity", OP],
		]);
	});

	it("leaves the caches alone when the delete fails", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 409 })),
		);
		const { result, invalidated } = renderActions(() =>
			usePickupLocationActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([]);
	});
});
