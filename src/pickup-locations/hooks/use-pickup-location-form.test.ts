import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePickupLocationForm } from "./use-pickup-location-form";

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
const BASE = `${API}/tour-operators/${OP}/pickup-locations`;

type FieldName = "name" | "time";

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => usePickupLocationForm(OP), { wrapper: Wrapper });
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

describe("usePickupLocationForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("trims the name and posts the time", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: {
						Location: `/api/tour-operators/${OP}/pickup-locations/pl-9`,
					},
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "  Harbour gate  ",
			time: "08:30",
		});

		expect(body).toHaveBeenCalledWith({ name: "Harbour gate", time: "08:30" });
	});

	it.each([
		"8:30",
		"24:00",
		"08:60",
		"0830",
	])("rejects %s as a time", async (time) => {
		const body = vi.fn();
		server.use(
			http.post(BASE, () => {
				body();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, { name: "Harbour gate", time });

		expect(body).not.toHaveBeenCalled();
	});
});
