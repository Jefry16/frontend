import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useMetafieldValueSave } from "./use-metafield-value-save";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const OWNER = "exp-1";
const BASE = `${API}/tour-operators/${OP}/experiences/${OWNER}/metafields`;

const change = (key: string, value: string, name = key) => ({
	namespace: "custom",
	key,
	name,
	value,
});

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMetafieldValueSave(OP, "experience", OWNER), {
		wrapper: Wrapper,
	});
};

const save = async (
	result: { current: { mutateAsync: (c: never) => Promise<unknown> } },
	changes: unknown[],
) => {
	await act(async () => {
		await result.current.mutateAsync(changes as never).catch(() => undefined);
	});
};

describe("useMetafieldValueSave", () => {
	// The owner kind decides the path segment, and "experience" is not the
	// plural the API uses. A wrong segment 404s every field at once.
	it("writes to the owner's plural path", async () => {
		const seen: string[] = [];
		server.use(
			http.put(`${BASE}/:ns/:key`, ({ request }) => {
				seen.push(new URL(request.url).pathname);
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await save(result, [change("difficulty", "hard")]);

		expect(seen[0]).toContain(
			"/experiences/exp-1/metafields/custom/difficulty",
		);
	});

	// An empty value is a CLEAR, not a value. A blank PUT is rejected by the
	// backend, so the branch is the only thing that makes clearing work at all.
	it("DELETEs an emptied field and PUTs the rest", async () => {
		const put = vi.fn();
		const del = vi.fn();
		server.use(
			http.put(`${BASE}/:ns/:key`, async ({ params, request }) => {
				put(params.key, await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
			http.delete(`${BASE}/:ns/:key`, ({ params }) => {
				del(params.key);
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await save(result, [change("difficulty", "hard"), change("notes", "")]);

		expect(put).toHaveBeenCalledWith("difficulty", { value: "hard" });
		expect(del).toHaveBeenCalledWith("notes");
	});

	// Sequential, not parallel. A field rejected mid-run stops the rest, and the
	// fields written BEFORE it stay written — which is why the caches refresh on
	// failure too, and why the editor cannot treat a failed save as a no-op.
	it("stops at the first rejection, keeping what already landed", async () => {
		const written: string[] = [];
		server.use(
			http.put(`${BASE}/:ns/:key`, ({ params }) => {
				if (params.key === "second") {
					return HttpResponse.json(
						{
							status: 422,
							error: "Unprocessable Entity",
							message: "Not a number",
						},
						{ status: 422 },
					);
				}
				written.push(params.key as string);
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render();

		await save(result, [
			change("first", "a"),
			change("second", "b"),
			change("third", "c"),
		]);

		expect(written).toEqual(["first"]);
	});

	// The operator is editing several fields at once, so "Not a number" alone
	// does not say which one to fix. The field's display name is prefixed.
	it("names the field that failed", async () => {
		server.use(
			http.put(`${BASE}/:ns/:key`, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Not a number",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render();

		await save(result, [change("capacity", "abc", "Max capacity")]);

		expect(toastMock.error).toHaveBeenCalledWith("Max capacity: Not a number");
	});

	// onSettled, not onSuccess: the values are stale either way, because a
	// partial run wrote some of them.
	it("refreshes the caches even when the save failed", async () => {
		const { Wrapper, queryClient } = wrapperWithProviders();
		const spy = vi.spyOn(queryClient, "invalidateQueries");
		server.use(
			http.put(
				`${BASE}/:ns/:key`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);
		const { result } = renderHook(
			() => useMetafieldValueSave(OP, "experience", OWNER),
			{ wrapper: Wrapper },
		);

		await save(result, [change("difficulty", "hard")]);

		expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toEqual([
			["metafield-values", OP, "experience", OWNER],
			["activity", OP],
		]);
	});
});
