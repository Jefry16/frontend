import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { MetaobjectDefinition } from "../types";
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

const EXISTING = {
	id: "def-1",
	type: "size-chart",
	name: "Size chart",
	description: "",
} as MetaobjectDefinition;

// The component used to await handleSubmit, check isValid, then mutate; that
// decision moved into form-core, so what these pin is the half that could
// regress silently — an invalid form must not reach the network at all. The
// edit case asserts the PUT body, which is shaped by the mutationFn: it names
// `name` and `description` and never forwards `fields`.
type Form = {
	setFieldValue: (n: string, v: unknown) => void;
	handleSubmit: () => Promise<void>;
};

const submit = (form: Form, values: Record<string, unknown>) => {
	act(() => {
		for (const [k, v] of Object.entries(values)) form.setFieldValue(k, v);
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

		await submit(result.current.form as Form, {
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
			// a whitespace-only description collapses to null
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

		await submit(result.current.form as Form, { name: "Sizing chart" });

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

		await submit(result.current.form as Form, {
			type: "size-chart",
			name: "",
			fields: [{ key: "waist", type: "single_line_text", name: "Waist" }],
		});

		expect(posted).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
