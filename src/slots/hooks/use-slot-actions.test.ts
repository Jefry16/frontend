import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useSlotActions } from "./use-slot-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "slot-1";
const BASE = `${API}/tour-operators/${OP}/slots/${ID}`;

const REFRESHED = {
	id: ID,
	context: "slots",
	status: "SOLD_OUT",
};

describe("useSlotActions", () => {
	it("writes the returned slot into the detail cache and invalidates the list", async () => {
		server.use(http.post(`${BASE}/cancel`, () => HttpResponse.json(REFRESHED)));
		const { result, invalidated, queryClient } = renderActions(() =>
			useSlotActions(OP, ID),
		);

		await fire(() => result.current.cancel.mutateAsync());

		expect(queryClient.getQueryData(["slots", OP, ID])).toEqual(REFRESHED);
		expect(invalidated()).toEqual([
			["slots", OP],
			["activity", OP],
		]);
	});

	it("offers no status setter", () => {
		const { result } = renderActions(() => useSlotActions(OP, ID));

		expect(Object.keys(result.current).sort()).toEqual([
			"cancel",
			"setCapacities",
		]);
	});

	it("shows the backend reason when a capacity is below what is booked", async () => {
		server.use(
			http.patch(BASE, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Capacity cannot be below the seats already booked",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = renderActions(() => useSlotActions(OP, ID));

		await fire(() =>
			result.current.setCapacities.mutateAsync([
				{ audienceId: "aud-1", capacity: 1 },
			]),
		);

		expect(
			await screen.findByText(
				"Capacity cannot be below the seats already booked",
			),
		).toBeInTheDocument();
	});
});
