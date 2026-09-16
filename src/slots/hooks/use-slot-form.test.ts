import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useSlotForm } from "./use-slot-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const EXP = "exp-1";
const URL = `${API}/tour-operators/${OP}/experiences/${EXP}/slots`;

const PRICES = [
	{ _key: "k1", audienceId: "aud-1", price: "30", capacity: "12" },
];

type FieldName =
	| "days"
	| "startTime"
	| "endTime"
	| "validFrom"
	| "validTo"
	| "audiencePrices";

// 2026-06-01 is a Monday; the window holds two of them.
const VALID: Partial<Record<FieldName, unknown>> = {
	days: [1],
	startTime: "09:00",
	endTime: "11:00",
	validFrom: "2026-06-01",
	validTo: "2026-06-14",
	audiencePrices: PRICES,
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useSlotForm(OP, EXP), { wrapper: Wrapper });
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
		return new HttpResponse(null, { status: 201 });
	});

describe("useSlotForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("expands the weekday pattern into departures, with prices as numbers", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body.mock.calls[0][0]).toEqual({
			departures: [
				{ startAt: "2026-06-01T09:00:00", endAt: "2026-06-01T11:00:00" },
				{ startAt: "2026-06-08T09:00:00", endAt: "2026-06-08T11:00:00" },
			],
			audiencePrices: [{ audienceId: "aud-1", price: 30, capacity: 12 }],
		});
	});

	it("schedules a single departure from a one-day window, ending the next day when it crosses midnight", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			...VALID,
			startTime: "22:00",
			endTime: "02:00",
			validTo: "2026-06-01",
		});

		expect(body.mock.calls[0][0].departures).toEqual([
			{ startAt: "2026-06-01T22:00:00", endAt: "2026-06-02T02:00:00" },
		]);
	});

	it("navigates to the availability list, not to a detail page", async () => {
		server.use(created(vi.fn()));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId/availability",
			params: { tourOperatorId: OP },
		});
	});

	it("rejects a window that ends before it starts", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			...VALID,
			validFrom: "2026-06-14",
			validTo: "2026-06-01",
		});

		expect(body).not.toHaveBeenCalled();
	});

	it("rejects an empty weekday set", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, { ...VALID, days: [] });

		expect(body).not.toHaveBeenCalled();
	});

	it("refuses a pattern whose weekdays never fall inside the window", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		// Sunday, over a Monday-to-Tuesday window
		await submit(result.current.form, {
			...VALID,
			days: [0],
			validTo: "2026-06-02",
		});

		expect(body).not.toHaveBeenCalled();
		expect(
			result.current.form.getFieldMeta("days")?.errors.map((e) => e?.message),
		).toEqual(["None of the selected days falls between the two dates"]);
	});

	it("refuses more departures than the backend creates at once", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		// every day for nineteen months: 579 departures against a cap of 500
		await submit(result.current.form, {
			...VALID,
			days: [0, 1, 2, 3, 4, 5, 6],
			validTo: "2027-12-31",
		});

		expect(body).not.toHaveBeenCalled();
		expect(
			result.current.form
				.getFieldMeta("validTo")
				?.errors.map((e) => e?.message),
		).toEqual(["At most 500 departures at once"]);
	});

	it("surfaces the backend's reason inline rather than as a toast", async () => {
		server.use(
			http.post(URL, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Date can be at most 24 months ahead",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBe(
			"Date can be at most 24 months ahead",
		);
	});
});
