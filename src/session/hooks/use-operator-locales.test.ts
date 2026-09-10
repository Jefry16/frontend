import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useOperatorLocales } from "./use-operator-locales";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

const OPERATOR = {
	id: OP,
	context: "tour-operators",
	name: "Acme Tours",
	handle: "acme",
	locales: { primaryLocale: "en", supportedLocales: ["en", "es"] },
};

describe("useOperatorLocales", () => {
	it("fills the operator's own cache entry, and narrows to the languages", async () => {
		const hit = vi.fn();
		server.use(
			http.get(`${API}/tour-operators/${OP}`, () => {
				hit();
				return HttpResponse.json(OPERATOR);
			}),
		);
		const { Wrapper, queryClient } = wrapperWithProviders();

		const { result } = renderHook(() => useOperatorLocales(OP), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(hit).toHaveBeenCalledTimes(1);

		expect(queryClient.getQueryData(queryKeys.operatorDetails(OP))).toEqual(
			OPERATOR,
		);

		expect(result.current.data).toEqual({
			primaryLocale: "en",
			supportedLocales: ["en", "es"],
		});
	});
});
