import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useResource } from "./use-resource";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

describe("useResource", () => {
	it("returns the body, not the axios envelope", async () => {
		server.use(
			http.get(`${API}/tour-operators/op-1/menus/m-1`, () =>
				HttpResponse.json({ id: "m-1", title: "Main menu" }),
			),
		);

		const { result } = renderHook(
			() =>
				useResource<{ id: string; title: string }>(
					["menus", "op-1", "m-1"],
					"/tour-operators/op-1/menus/m-1",
				),
			{ wrapper: wrapperWithProviders().Wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual({ id: "m-1", title: "Main menu" });
	});

	it("surfaces a 404 as an error rather than empty data", async () => {
		server.use(
			http.get(`${API}/tour-operators/op-1/menus/gone`, () =>
				HttpResponse.json({ message: "Menu not found" }, { status: 404 }),
			),
		);

		const { result } = renderHook(
			() =>
				useResource(
					["menus", "op-1", "gone"],
					"/tour-operators/op-1/menus/gone",
				),
			{ wrapper: wrapperWithProviders().Wrapper },
		);

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.data).toBeUndefined();
	});
});
