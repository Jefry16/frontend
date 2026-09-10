import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useSingleSlotForm } from "./use-single-slot-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const EXP = "exp-1";
const URL = `${API}/tour-operators/${OP}/experiences/${EXP}/slot`;

const PRICES = [
	{ _key: "k1", audienceId: "aud-1", price: "25.50", capacity: "8" },
];

type FieldName = "date" | "startTime" | "endTime" | "audiencePrices";

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useSingleSlotForm(OP, EXP), { wrapper: Wrapper });
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
	http.post(URL, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, {
			status: 201,
			headers: { Location: `/api/tour-operators/${OP}/slots/slot-9` },
		});
	});

describe("useSingleSlotForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("composes the wall-clock fields into start and end instants", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			date: "2026-06-01",
			startTime: "10:00",
			endTime: "11:30",
			audiencePrices: PRICES,
		});

		expect(body.mock.calls[0][0]).toMatchObject({
			startAt: "2026-06-01T10:00:00",
			endAt: "2026-06-01T11:30:00",
		});
	});

	it("rolls the end date forward when the departure crosses midnight", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			date: "2026-06-01",
			startTime: "22:00",
			endTime: "02:00",
			audiencePrices: PRICES,
		});

		expect(body.mock.calls[0][0]).toMatchObject({
			startAt: "2026-06-01T22:00:00",
			endAt: "2026-06-02T02:00:00",
		});
	});

	it("strips the row key and sends prices as numbers", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			date: "2026-06-01",
			startTime: "10:00",
			endTime: "11:30",
			audiencePrices: PRICES,
		});

		expect(body.mock.calls[0][0].audiencePrices).toEqual([
			{ audienceId: "aud-1", price: 25.5, capacity: 8 },
		]);
	});

	it("navigates to the created slot using the id from Location", async () => {
		server.use(created(vi.fn()));
		const { result } = render();

		await submit(result.current.form, {
			date: "2026-06-01",
			startTime: "10:00",
			endTime: "11:30",
			audiencePrices: PRICES,
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId/availability/$slotId",
			params: { tourOperatorId: OP, slotId: "slot-9" },
		});
	});

	it("does not reach the network when the form is invalid", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			date: "",
			startTime: "10:00",
			endTime: "11:30",
			audiencePrices: PRICES,
		});

		expect(body).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
