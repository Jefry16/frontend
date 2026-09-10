import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMemberActions } from "./use-member-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "user-9";
const BASE = `${API}/tour-operators/${OP}/members/${ID}`;

const MEMBER = ["members", OP, ID];
const ROSTER = ["members", OP];
const TRAIL = ["activity", OP];
const PROFILE = ["auth", "profile"];

describe("useMemberActions", () => {
	it("patches the role and refreshes member, roster and trail", async () => {
		const body = vi.fn();
		server.use(
			http.patch(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useMemberActions(OP, ID),
		);

		await fire(() => result.current.changeRole.mutateAsync("ADMIN"));

		expect(body).toHaveBeenCalledWith({ role: "ADMIN" });
		expect(invalidated()).toEqual([MEMBER, ROSTER, TRAIL]);
	});

	it("also refreshes the caller's own profile on an ownership transfer", async () => {
		const body = vi.fn();
		server.use(
			http.patch(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useMemberActions(OP, ID),
		);

		await fire(() => result.current.transferOwnership.mutateAsync());

		expect(body).toHaveBeenCalledWith({ role: "OWNER" });
		expect(invalidated()).toEqual([MEMBER, ROSTER, TRAIL, PROFILE]);
	});

	it("drops the roster and the trail on remove", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useMemberActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([ROSTER, TRAIL]);
	});
});
