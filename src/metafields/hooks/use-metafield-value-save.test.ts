import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { MetafieldOwnerTypeCode } from "../types";
import { useMetafieldValueSave } from "./use-metafield-value-save";

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
	result: {
		current: { save: { mutateAsync: (c: never) => Promise<unknown> } };
	},
	changes: unknown[],
) => {
	await act(async () => {
		await result.current.save
			.mutateAsync(changes as never)
			.catch(() => undefined);
	});
};

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

	it("carries an emptied field as a blank rather than dropping it", async () => {
		const seen: { path: string; body: unknown }[] = [];
		server.use(recording(seen));
		const { result } = render();

		await save(result, [change("notes", "")]);

		expect(seen[0].body).toEqual({ values: { "custom.notes": "" } });
	});

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

	it("keeps the backend's reason beside the form when the write is refused", async () => {
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

		expect(result.current.errorMessage).toBe(
			"A number_integer metafield value must be a whole number",
		);
	});
});
