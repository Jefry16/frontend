import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useUiLanguages } from "./use-ui-languages";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

describe("useUiLanguages", () => {
	it("offers only the languages this app can show, whatever the backend lists", async () => {
		server.use(
			http.get(`${API}/ui-languages`, () => HttpResponse.json(["es", "en", "fr"])),
		);
		const { result } = renderHook(() => useUiLanguages(), {
			wrapper: wrapperWithProviders({ withAuth: true }).Wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(["en"]);
	});
});
