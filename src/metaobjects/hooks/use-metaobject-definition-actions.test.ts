import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMetaobjectDefinitionActions } from "./use-metaobject-definition-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "def-1";
const BASE = `${API}/tour-operators/${OP}/metaobject-definitions/${ID}`;

const DETAIL = ["metaobject-definitions", OP, ID];
const LIST = ["metaobject-definitions", OP];
const ENTRIES = ["metaobjects", OP];
const TRAIL = ["activity", OP];

describe("useMetaobjectDefinitionActions", () => {
	// Deleting the blueprint takes its entries with it, so the entry list has to
	// go even though this hook never touched an entry.
	it("drops the entry list too when the definition goes", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectDefinitionActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([LIST, ENTRIES, TRAIL]);
	});

	it("posts a new field to /fields", async () => {
		const body = vi.fn();
		server.use(
			http.post(`${BASE}/fields`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectDefinitionActions(OP, ID),
		);

		await fire(() =>
			result.current.addField.mutateAsync({
				key: "waist",
				type: "single_line_text",
				name: "Waist",
			}),
		);

		expect(body).toHaveBeenCalledWith({
			key: "waist",
			type: "single_line_text",
			name: "Waist",
		});
		expect(invalidated()).toEqual([DETAIL, LIST, TRAIL]);
	});

	// Rename is the display name only — the key is the identity every stored
	// value is filed under, so it addresses the field rather than being sent.
	it("renames by key in the path and sends only the name", async () => {
		const body = vi.fn();
		server.use(
			http.patch(`${BASE}/fields/waist`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = renderActions(() =>
			useMetaobjectDefinitionActions(OP, ID),
		);

		await fire(() =>
			result.current.renameField.mutateAsync({
				key: "waist",
				name: "Waistline",
			}),
		);

		expect(body).toHaveBeenCalledWith({ name: "Waistline" });
		expect(body.mock.calls[0][0]).not.toHaveProperty("key");
	});

	// Removing a field cascades its values, so every entry's cached detail is
	// stale — the entry list joins the usual definition set.
	it("drops the entry list when a field is removed", async () => {
		server.use(
			http.delete(
				`${BASE}/fields/waist`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		const { result, invalidated } = renderActions(() =>
			useMetaobjectDefinitionActions(OP, ID),
		);

		await fire(() => result.current.removeField.mutateAsync({ key: "waist" }));

		expect(invalidated()).toEqual([ENTRIES, DETAIL, LIST, TRAIL]);
	});
});
