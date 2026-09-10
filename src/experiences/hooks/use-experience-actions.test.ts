import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useExperienceActions } from "./use-experience-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "exp-1";
const BASE = `${API}/tour-operators/${OP}/experiences/${ID}`;

const SET = [
	["experiences", OP, ID],
	["experiences", OP],
	["activity", OP],
];

describe("useExperienceActions", () => {
	// There is no delete: an experience owns slots and bookings, so retiring one
	// is an unpublish. A delete appearing here would be the regression.
	it("offers publish and unpublish, and nothing destructive", () => {
		const { result } = renderActions(() => useExperienceActions(OP, ID));

		expect(Object.keys(result.current).sort()).toEqual([
			"publish",
			"unpublish",
		]);
	});

	// Both go to the SAME endpoint; the body is the only thing that differs, so
	// asserting it is the only way to tell an unpublish from a publish.
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
			useExperienceActions(OP, ID),
		);

		await fire(() => result.current[action].mutateAsync());

		expect(body).toHaveBeenCalledWith({ published });
		expect(invalidated()).toEqual(SET);
	});
});
