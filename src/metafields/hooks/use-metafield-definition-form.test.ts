import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useMetafieldDefinitionForm } from "./use-metafield-definition-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/metafield-definitions`;

const EXISTING = {
	id: "def-1",
	context: "metafield-definitions",
	ownerType: "experience",
	namespace: "custom",
	key: "difficulty",
	type: "single_line_text",
	name: "Difficulty",
	description: "",
	metaobjectDefinitionId: null,
};

type FieldName =
	| "ownerType"
	| "namespace"
	| "key"
	| "type"
	| "name"
	| "description"
	| "metaobjectDefinitionId";

const render = (definition?: typeof EXISTING) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMetafieldDefinitionForm(OP, definition as never), {
		wrapper: Wrapper,
	});
};

const submit = async (
	form: {
		setFieldValue: (n: FieldName, v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Partial<Record<FieldName, string>>,
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

describe("useMetafieldDefinitionForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("nulls the metaobject pin for a non-reference type", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `${BASE}/def-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			ownerType: "experience",
			namespace: "custom",
			key: "difficulty",
			type: "single_line_text",
			name: "Difficulty",
			metaobjectDefinitionId: "mo-1",
		});

		expect(body.mock.calls[0][0].metaobjectDefinitionId).toBeNull();
	});

	it("keeps the pin for a metaobject_reference", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `${BASE}/def-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			ownerType: "experience",
			namespace: "custom",
			key: "guide",
			type: "metaobject_reference",
			name: "Guide",
			metaobjectDefinitionId: "mo-1",
		});

		expect(body.mock.calls[0][0].metaobjectDefinitionId).toBe("mo-1");
	});

	it("sends only name and description on edit", async () => {
		const body = vi.fn();
		server.use(
			http.put(`${BASE}/def-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, { name: "Difficulty level" });

		expect(body).toHaveBeenCalledWith({
			name: "Difficulty level",
			description: null,
		});
	});

	it("collapses a blank description to null", async () => {
		const body = vi.fn();
		server.use(
			http.put(`${BASE}/def-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, { name: "Difficulty", description: "" });

		expect(body.mock.calls[0][0].description).toBeNull();
	});
});
