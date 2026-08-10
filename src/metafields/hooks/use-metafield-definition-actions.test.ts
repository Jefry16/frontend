import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useMetafieldDefinitionActions } from "./use-metafield-definition-actions";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "def-1";
const BASE = `${API}/tour-operators/${OP}/metafield-definitions/${ID}`;

describe("useMetafieldDefinitionActions", () => {
	// The delete cascades every stored value, on owners this hook knows nothing
	// about — so it drops the whole `metafield-values` prefix rather than a key.
	// Without that, an experience's editor keeps rendering a deleted field.
	it("drops every owner's cached values, not just the definition list", async () => {
		server.use(
			http.delete(BASE, () => new HttpResponse(null, { status: 204 })),
		);
		const { result, invalidated } = renderActions(() =>
			useMetafieldDefinitionActions(OP, ID),
		);

		await fire(() => result.current.remove.mutateAsync());

		expect(invalidated()).toEqual([
			["metafield-definitions", OP],
			["metafield-values"],
			["activity", OP],
		]);
	});
});
