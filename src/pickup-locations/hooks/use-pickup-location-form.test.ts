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

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/pickup-locations`;

type FieldName = "name" | "time" | "prices.aud-adult" | "prices.aud-child";

const AUDIENCES = [
	{
		id: "aud-adult",
		context: "audiences",
		name: "Adult",
		paxPerUnit: 1,
		createdAt: "",
	},
	{
		id: "aud-child",
		context: "audiences",
		name: "Child",
		paxPerUnit: 1,
		createdAt: "",
	},
] as const;

const render = (pickup?: Parameters<typeof usePickupLocationForm>[2]) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => usePickupLocationForm(OP, [...AUDIENCES], pickup), {
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

		expect(body).toHaveBeenCalledWith({
			name: "Harbour gate",
			time: "08:30",
			audiencePrices: [
				{ audienceId: "aud-adult", price: 0 },
				{ audienceId: "aud-child", price: 0 },
			],
		});
	});

	it("names every audience, an empty price as 0, so none is left to the backend's default", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "Harbour gate",
			time: "08:30",
			"prices.aud-adult": "12.50",
		});

		expect(body.mock.calls[0][0].audiencePrices).toEqual([
			{ audienceId: "aud-adult", price: 12.5 },
			{ audienceId: "aud-child", price: 0 },
		]);
	});

	it("an edit opens on the location's prices, a free audience blank", () => {
		const { result } = render({
			id: "pl-1",
			context: "pickup-locations",
			name: "Harbour gate",
			time: "08:30:00",
			createdAt: "",
			audiencePrices: [
				{ audienceId: "aud-adult", audienceName: "Adult", price: 12.5 },
				{ audienceId: "aud-child", audienceName: "Child", price: 0 },
			],
		});

		expect(result.current.form.state.values.prices).toEqual({
			"aud-adult": "12.5",
			"aud-child": "",
		});
	});

	it("refuses a price that is not a number", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, () => {
				body();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "Harbour gate",
			time: "08:30",
			"prices.aud-adult": "abc",
		});

		expect(body).not.toHaveBeenCalled();
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
