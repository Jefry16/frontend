import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useInvitationActions } from "./use-invitation-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "inv-1";
const BASE = `${API}/tour-operators/${OP}/invitations/${ID}`;

const SET = [
	["invitations", OP, ID],
	["invitations", OP],
	["activity", OP],
];

describe("useInvitationActions", () => {
	it("resends, refreshing the detail so the new expiry shows", async () => {
		const hit = vi.fn();
		server.use(
			http.post(`${BASE}/resend`, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useInvitationActions(OP, ID),
		);

		await fire(() => result.current.resend.mutateAsync());

		expect(hit).toHaveBeenCalled();
		expect(invalidated()).toEqual(SET);
	});

	it("revokes and still refreshes the detail", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useInvitationActions(OP, ID),
		);

		await fire(() => result.current.revoke.mutateAsync());

		expect(invalidated()).toEqual(SET);
	});
});
