import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { MetafieldOwnerTypeCode } from "../types";
import { useMetafieldValueSave } from "./use-metafield-value-save";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const EXP = "exp-1";

const change = (key: string, value: string) => ({
	namespace: "custom",
	key,
	value,
});

const render = (
	ownerType: MetafieldOwnerTypeCode = "experience",
	owner = EXP,
) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMetafieldValueSave(OP, ownerType, owner), {
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

/** Records the one request the whole edit should now be. */
const recording = (seen: { path: string; body: unknown }[]) =>
	http.put(
		`${API}/tour-operators/:op/metafields/:ownerType/:ownerId`,
		async ({ request }) => {
			seen.push({
				path: new URL(request.url).pathname,
				body: await request.json(),
			});
			return new HttpResponse(null, { status: 204 });
		},
	);

describe("useMetafieldValueSave", () => {
	// One request for the whole edit, keyed `namespace.key`. It used to be one
	// request per field, so a count of 1 is half of what this asserts.
	it("sends the whole edit as a single keyed write", async () => {
		const seen: { path: string; body: unknown }[] = [];
		server.use(recording(seen));
		const { result } = render();

		await save(result, [change("difficulty", "3"), change("tagline", "Go")]);

		expect(seen).toHaveLength(1);
		expect(seen[0].body).toEqual({
			values: { "custom.difficulty": "3", "custom.tagline": "Go" },
		});
	});

	// An emptied box is a CLEAR, and a clear is a key sent blank. Omitting it
	// would leave the old value in place — a save that says it worked and
	// changes nothing — because the write is a merge, not a replace.
	it("carries an emptied field as a blank rather than dropping it", async () => {
		const seen: { path: string; body: unknown }[] = [];
		server.use(recording(seen));
		const { result } = render();

		await save(result, [change("notes", "")]);

		expect(seen[0].body).toEqual({ values: { "custom.notes": "" } });
	});

	// The owner is addressed by type and id. The operator is its own owner, and
	// its id used to be dropped from the path because it was already the tenant
	// — which is exactly what 404s against the endpoint that replaced it.
	it.each([
		[
			"experience",
			EXP,
			`/api/tour-operators/${OP}/metafields/experience/${EXP}`,
		],
		[
			"tour_operator",
			OP,
			`/api/tour-operators/${OP}/metafields/tour_operator/${OP}`,
		],
	] as const)("addresses the %s owner by type and id", async (type, owner, path) => {
		const seen: { path: string; body: unknown }[] = [];
		server.use(recording(seen));
		const { result } = render(type, owner);

		await save(result, [change("difficulty", "3")]);

		expect(seen[0].path).toBe(path);
	});

	// The backend validates every entry before writing any, so a refusal leaves
	// nothing written and the message names the key that caused it.
	it("surfaces the backend's reason when the write is refused", async () => {
		server.use(
			http.put(`${API}/tour-operators/:op/metafields/:ownerType/:ownerId`, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "A number_integer metafield value must be a whole number",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render();

		await save(result, [change("difficulty", "hard")]);

		expect(toastMock.error).toHaveBeenCalledWith(
			"A number_integer metafield value must be a whole number",
		);
	});
});
