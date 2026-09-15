import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMetaobjectDefinitionActions } from "./use-metaobject-definition-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "def-1";
const BASE = `${API}/tour-operators/${OP}/metaobject-definitions/${ID}`;

const DETAIL = ["metaobject-definitions", OP, ID];
const LIST = ["metaobject-definitions", OP];
const ENTRIES = ["metaobjects", OP];
const TRAIL = ["activity", OP];

describe("useMetaobjectDefinitionActions", () => {
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
