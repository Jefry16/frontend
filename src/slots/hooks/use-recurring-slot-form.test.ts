import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useRecurringSlotForm } from "./use-recurring-slot-form";

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

const VALID: Partial<Record<FieldName, unknown>> = {
	days: [1, 3, 5],
	startTime: "09:00",
	endTime: "11:00",
	validFrom: "2026-06-01",
	validTo: "2026-06-30",
	audiencePrices: PRICES,
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useRecurringSlotForm(OP, EXP), { wrapper: Wrapper });
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

describe("useRecurringSlotForm", () => {
	beforeEach(() => navigateMock.mockReset());

	// Unlike the single-slot form there is no composing: the weekday pattern and
	// the date window go over as-is, and the BACKEND expands them into departures.
	it("sends the pattern and window verbatim, with prices as numbers", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body.mock.calls[0][0]).toEqual({
			days: [1, 3, 5],
			startTime: "09:00",
			endTime: "11:00",
			validFrom: "2026-06-01",
			validTo: "2026-06-30",
			audiencePrices: [{ audienceId: "aud-1", price: 30, capacity: 12 }],
		});
	});

	// Many slots are minted at once and the response carries no Location, so this
	// is the one create in the app that lands on the LIST rather than a detail.
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
			validFrom: "2026-06-30",
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

	it("surfaces the backend's reason inline rather than as a toast", async () => {
		server.use(
			http.post(URL, () =>
				HttpResponse.json(
					{
						status: 422,
						error: "Unprocessable Entity",
						message: "Window may not exceed one year",
					},
					{ status: 422 },
				),
			),
		);
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(result.current.errorMessage).toBe("Window may not exceed one year");
	});
});
