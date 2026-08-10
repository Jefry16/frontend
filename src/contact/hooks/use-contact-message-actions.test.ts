import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useContactMessageActions } from "./use-contact-message-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "msg-1";
const BASE = `${API}/tour-operators/${OP}/contact-messages/${ID}`;

const DETAIL = ["contact-messages", OP, ID];
const LIST = ["contact-messages", OP];
const TRAIL = ["activity", OP];

describe("useContactMessageActions", () => {
	// Read and unread are separate endpoints, not one flag — the read state is
	// the only member-writable thing on a message.
	it.each([
		[true, "read"],
		[false, "unread"],
	])("posts to /%s for read=%s", async (read, segment) => {
		const hit = vi.fn();
		server.use(
			http.post(`${BASE}/${segment}`, () => {
				hit();
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useContactMessageActions(OP, ID),
		);

		await fire(() => result.current.setRead.mutateAsync({ read }));

		expect(hit).toHaveBeenCalled();
		// No trail: the read flip is unaudited by design.
		expect(invalidated()).toEqual([DETAIL, LIST]);
	});

	it("refreshes the list and the trail on delete, never the deleted detail", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useContactMessageActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([LIST, TRAIL]);
	});
});
