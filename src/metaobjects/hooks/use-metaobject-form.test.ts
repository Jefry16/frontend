import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useMetaobjectForm } from "./use-metaobject-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/metaobjects`;

const DEFINITION = {
	id: "def-1",
	context: "metaobject-definitions",
	type: "size-chart",
	name: "Size chart",
	description: "",
	fields: [
		{ key: "waist", type: "single_line_text", name: "Waist" },
		{ key: "chest", type: "single_line_text", name: "Chest" },
	],
} as never;

type FieldName = "handle" | "name" | "values";

const render = (entry?: unknown) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMetaobjectForm(OP, DEFINITION, entry as never), {
		wrapper: Wrapper,
	});
};

const submit = async (
	form: {
		setFieldValue: (n: FieldName, v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Partial<Record<FieldName, unknown>>,
) => {
	act(() => {
		for (const key of Object.keys(values) as FieldName[]) {
			form.setFieldValue(key, values[key] as never);
		}
	});
	await act(async () => {
		await form.handleSubmit();
	});
};

const created = (body: ReturnType<typeof vi.fn>) =>
	http.post(BASE, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, {
			status: 201,
			headers: { Location: `${BASE}/entry-9` },
		});
	});

describe("useMetaobjectForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("sends one value per definition field, blanks as null", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			handle: "small",
			name: "Small",
			values: { waist: "70cm", chest: "   " },
		});

		expect(body.mock.calls[0][0]).toEqual({
			definitionId: "def-1",
			handle: "small",
			name: "Small",
			values: { waist: "70cm", chest: null },
		});
	});

	it("drops a stale key the definition does not declare", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			handle: "small",
			name: "Small",
			values: { waist: "70cm", chest: "90cm", hips: "95cm" },
		});

		expect(body.mock.calls[0][0].values).toEqual({
			waist: "70cm",
			chest: "90cm",
		});
	});

	it("sends definitionId on create and never on edit", async () => {
		const patched = vi.fn();
		server.use(
			http.patch(`${BASE}/entry-1`, async ({ request }) => {
				patched(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render({
			id: "entry-1",
			handle: "small",
			name: "Small",
			fields: [{ key: "waist", value: "70cm" }],
		});

		await submit(result.current.form, { name: "Small size" });

		expect(patched.mock.calls[0][0]).not.toHaveProperty("definitionId");
		expect(patched.mock.calls[0][0]).toMatchObject({ name: "Small size" });
	});
});
