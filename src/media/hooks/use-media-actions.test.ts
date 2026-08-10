import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMediaActions } from "./use-media-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "media-1";
const BASE = `${API}/tour-operators/${OP}/media/${ID}`;

const ASSET = ["media", OP, ID];
const LIST = ["media", OP];
const TRAIL = ["activity", OP];

describe("useMediaActions", () => {
	it("patches the alt text and refreshes asset, list and trail", async () => {
		const body = vi.fn();
		server.use(
			http.patch(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useMediaActions(OP, ID),
		);

		await fire(() => result.current.describe.mutateAsync("A boat at dawn"));

		expect(body).toHaveBeenCalledWith({ alt: "A boat at dawn" });
		expect(invalidated()).toEqual([ASSET, LIST, TRAIL]);
	});

	// Blank is a real value here — it CLEARS the description, so it must still
	// reach the wire rather than being skipped as empty.
	it("sends a blank alt rather than omitting it", async () => {
		const body = vi.fn();
		server.use(
			http.patch(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = renderActions(() => useMediaActions(OP, ID));

		await fire(() => result.current.describe.mutateAsync(""));

		expect(body).toHaveBeenCalledWith({ alt: "" });
	});

	it("drops the list and the trail on delete", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useMediaActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([LIST, TRAIL]);
	});
});
