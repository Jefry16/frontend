import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { MetaobjectDefinition, MetaobjectField } from "../types";
import { useMetaobjectDefinitionForm } from "./use-metaobject-definition-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/metaobject-definitions`;

const EXISTING: MetaobjectDefinition = {
	id: "def-1",
	context: "metaobject-definitions",
	type: "size-chart",
	name: "Size chart",
	description: "",
	fields: [],
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
};

type FieldName = "type" | "name" | "description" | "fields";
type FieldValue = string | MetaobjectField[];

const submit = (
	form: {
		setFieldValue: (n: FieldName, v: FieldValue) => void;
		handleSubmit: () => Promise<void>;
	},
	values: Partial<Record<FieldName, FieldValue>>,
) => {
	act(() => {
		for (const key of Object.keys(values) as FieldName[]) {
			const value = values[key];
			if (value !== undefined) form.setFieldValue(key, value);
		}
	});
	return act(async () => {
		await form.handleSubmit();
	});
};

describe("useMetaobjectDefinitionForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("creates with the field set the form collected", async () => {
		const posted = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				posted(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: {
						Location: `/api/tour-operators/${OP}/metaobject-definitions/def-9`,
					},
				});
			}),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useMetaobjectDefinitionForm(OP), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, {
			type: "size-chart",
			name: "Size chart",
			description: "  ",
			fields: [{ key: "waist", type: "single_line_text", name: "Waist" }],
		});

		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId",
				params: { tourOperatorId: OP, definitionId: "def-9" },
			}),
		);
		expect(posted.mock.calls[0][0]).toEqual({
			type: "size-chart",
			name: "Size chart",
			description: null,
			fields: [{ key: "waist", type: "single_line_text", name: "Waist" }],
		});
	});

	it("edits without sending fields — the set is managed on the detail", async () => {
		const put = vi.fn();
		server.use(
			http.put(`${BASE}/def-1`, async ({ request }) => {
				put(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(
			() => useMetaobjectDefinitionForm(OP, EXISTING),
			{ wrapper: Wrapper },
		);

		await submit(result.current.form, { name: "Sizing chart" });

		await waitFor(() => expect(put).toHaveBeenCalled());
		expect(put.mock.calls[0][0]).toEqual({
			name: "Sizing chart",
			description: null,
		});
		expect(put.mock.calls[0][0]).not.toHaveProperty("fields");
	});

	it("does not create when a required field is blank", async () => {
		const posted = vi.fn();
		server.use(
			http.post(BASE, () => {
				posted();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useMetaobjectDefinitionForm(OP), {
			wrapper: Wrapper,
		});

		await submit(result.current.form, {
			type: "size-chart",
			name: "",
			fields: [{ key: "waist", type: "single_line_text", name: "Waist" }],
		});

		expect(posted).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
