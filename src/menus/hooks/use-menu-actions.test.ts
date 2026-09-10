import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMenuActions } from "./use-menu-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "menu-1";
const BASE = `${API}/tour-operators/${OP}/menus/${ID}`;

const DETAIL = ["menus", OP, ID];
const LIST = ["menus", OP];
const TRAIL = ["activity", OP];

describe("useMenuActions", () => {
	it("renames the title and never the handle", async () => {
		const body = vi.fn();
		server.use(
			http.patch(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() => useMenuActions(OP, ID));

		await fire(() => result.current.rename.mutateAsync({ title: "Main" }));

		expect(body).toHaveBeenCalledWith({ title: "Main" });
		expect(body.mock.calls[0][0]).not.toHaveProperty("handle");
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	it("puts the whole tree under `items` on save", async () => {
		const body = vi.fn();
		server.use(
			http.put(`${BASE}/items`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() => useMenuActions(OP, ID));
		const items = [{ title: "Home", kind: "EXTERNAL_URL", url: "/" }];

		await fire(() => result.current.replaceItems.mutateAsync(items as never));

		expect(body).toHaveBeenCalledWith({ items });
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	it("drops the list and the trail on delete", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() => useMenuActions(OP, ID));

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([LIST, TRAIL]);
	});

	it("surfaces the backend reason on a rename conflict, not on a failed delete", async () => {
		server.use(
			http.patch(BASE, () =>
				HttpResponse.json(
					{ status: 409, error: "Conflict", message: "That title is taken" },
					{ status: 409 },
				),
			),
			http.delete(BASE, () => new HttpResponse(null, { status: 500 })),
		);
		const { result } = renderActions(() => useMenuActions(OP, ID));

		await fire(() => result.current.rename.mutateAsync({ title: "Main" }));
		expect(toastMock.error).toHaveBeenCalledWith("That title is taken");

		toastMock.error.mockClear();
		await fire(() => result.current.remove.mutateAsync());
		expect(toastMock.error).not.toHaveBeenCalledWith("That title is taken");
	});
});
