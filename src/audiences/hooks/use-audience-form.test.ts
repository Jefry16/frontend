import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAudienceForm } from "./use-audience-form";

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
const BASE = `${API}/tour-operators/${OP}/audiences`;

const EXISTING = {
	id: "aud-1",
	context: "audiences" as const,
	name: "Adults",
	paxPerUnit: 1,
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
};

type FieldName = "name" | "paxPerUnit";

const render = (existing?: typeof EXISTING) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useAudienceForm(OP, existing), { wrapper: Wrapper });
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

describe("useAudienceForm", () => {
	beforeEach(() => navigateMock.mockReset());

	// paxPerUnit is a text input, so it arrives as a string; the column is an
	// integer. The schema's transform is the only thing converting it.
	it("posts the name and a NUMERIC paxPerUnit, then goes to the detail", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `/api/tour-operators/${OP}/audiences/aud-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "  Children  ",
			paxPerUnit: "2",
		});

		expect(body).toHaveBeenCalledWith({ name: "Children", paxPerUnit: 2 });
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId/audiences/$audienceId",
			params: { tourOperatorId: OP, audienceId: "aud-9" },
		});
	});

	it("patches the existing record on edit rather than creating a second", async () => {
		const patched = vi.fn();
		const posted = vi.fn();
		server.use(
			http.patch(`${BASE}/aud-1`, async ({ request }) => {
				patched(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
			http.post(BASE, () => {
				posted();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, { name: "Adult", paxPerUnit: "1" });

		expect(patched).toHaveBeenCalledWith({ name: "Adult", paxPerUnit: 1 });
		expect(posted).not.toHaveBeenCalled();
	});

	it("rejects a non-positive paxPerUnit before the network", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, () => {
				body();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, { name: "Children", paxPerUnit: "0" });

		expect(body).not.toHaveBeenCalled();
	});

	// 409 here means the name is taken, which the operator can fix by renaming.
	it("names a duplicate inline instead of a generic failure", async () => {
		server.use(
			http.post(BASE, () =>
				HttpResponse.json(
					{
						status: 409,
						error: "Conflict",
						message: "Audience name already used",
					},
					{ status: 409 },
				),
			),
		);
		const { result } = render();

		await submit(result.current.form, { name: "Adults", paxPerUnit: "1" });

		expect(result.current.errorMessage).toBeTruthy();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
