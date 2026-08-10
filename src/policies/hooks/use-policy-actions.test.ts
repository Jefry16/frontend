import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { usePolicyActions } from "./use-policy-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "policy-1";
const BASE = `${API}/tour-operators/${OP}/policies/${ID}`;

describe("usePolicyActions", () => {
	it("deletes, then refreshes the list and the trail", async () => {
		const hit = vi.fn();
		server.use(
			http.delete(BASE, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			usePolicyActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(hit).toHaveBeenCalled();
		expect(invalidated()).toEqual([
			["policies", OP],
			["activity", OP],
		]);
	});
});
