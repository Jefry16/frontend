import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { fire, renderActions } from "#/test/actions";
import { server } from "#/test/server";
import { useContactMessageActions } from "./use-contact-message-actions";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "msg-1";
const BASE = `${API}/tour-operators/${OP}/contact-messages/${ID}`;

const LIST = ["contact-messages", OP];
const TRAIL = ["activity", OP];

describe("useContactMessageActions", () => {
	it("offers delete and nothing else", () => {
		const { result } = renderActions(() => useContactMessageActions(OP, ID));

		expect(Object.keys(result.current)).toEqual(["remove"]);
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
