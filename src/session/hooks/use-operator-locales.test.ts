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
	// The languages had their own route once; it was folded into the operator's
	// own record. This hook therefore reads the operator, under the operator's
	// key, and narrows — so the seven translation editors that ask for the
	// languages share one entry and one request with the settings screen instead
	// of fetching the same record a second time under a name of their own.
	//
	// Neither a gate nor a screen can see any of that. Give the hook a private
	// key again and every consumer still renders, just with twice the traffic and
	// two copies of one record free to disagree.
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

		// The WHOLE operator lands under the shared key, which is what lets another
		// reader of that key be served without a second request. Storing only the
		// slice here would look identical to the consumers below and starve them.
		expect(queryClient.getQueryData(queryKeys.operatorDetails(OP))).toEqual(
			OPERATOR,
		);

		// Consumers read `.primaryLocale` straight off the hook, so it has to hand
		// back the section and not the record it came from.
		expect(result.current.data).toEqual({
			primaryLocale: "en",
			supportedLocales: ["en", "es"],
		});
	});
});
