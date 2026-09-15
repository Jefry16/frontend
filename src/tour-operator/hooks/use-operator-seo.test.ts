import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useOperatorSeoSave } from "./use-operator-seo";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}`;

const patching = (body: ReturnType<typeof vi.fn>) =>
	http.patch(URL_, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

describe("useOperatorSeoSave", () => {
	it("sends one section, with all three of its fields", async () => {
		const body = vi.fn();
		server.use(patching(body));
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useOperatorSeoSave(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save.mutateAsync({
				seoTitle: "Sail the coast",
				seoDescription: null,
				ogImageMediaId: "m-og",
			});
		});

		expect(body).toHaveBeenCalledWith({
			seo: {
				seoTitle: "Sail the coast",
				seoDescription: null,
				ogImageMediaId: "m-og",
			},
		});
	});

	it("refreshes the operator and the trail", async () => {
		server.use(patching(vi.fn()));
		const { Wrapper, queryClient } = wrapperWithProviders();
		const spy = vi.spyOn(queryClient, "invalidateQueries");
		const { result } = renderHook(() => useOperatorSeoSave(OP), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.save.mutateAsync({
				seoTitle: null,
				seoDescription: null,
				ogImageMediaId: null,
			});
		});

		expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toEqual([
			queryKeys.operatorDetails(OP),
			queryKeys.activity(OP),
		]);
	});

	it("keeps the refusal beside the form and clears it on the next save", async () => {
		server.use(
			http.patch(URL_, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "SEO title is too long",
					},
					{ status: 422 },
				),
			),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useOperatorSeoSave(OP), {
			wrapper: Wrapper,
		});
		const seo = { seoTitle: "x", seoDescription: null, ogImageMediaId: null };

		await act(async () => {
			await result.current.save.mutateAsync(seo).catch(() => undefined);
		});
		expect(result.current.errorMessage).toBe("SEO title is too long");

		server.use(patching(vi.fn()));
		await act(async () => {
			await result.current.save.mutateAsync(seo);
		});
		expect(result.current.errorMessage).toBeNull();
	});
});
