import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useExperienceForm } from "./use-experience-form";

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
const BASE = `${API}/tour-operators/${OP}/experiences`;

type FieldName =
	| "name"
	| "description"
	| "longDescription"
	| "bookingCutoffHours"
	| "startingPrice"
	| "featured"
	| "thumbnailMediaId"
	| "mediaIds";

const VALID: Partial<Record<FieldName, unknown>> = {
	name: "Sunset Sailing",
	description: "An evening on the water",
	longDescription: "<p>Longer</p>",
	bookingCutoffHours: "24",
	startingPrice: "95",
};

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useExperienceForm(OP), { wrapper: Wrapper });
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
			headers: { Location: `${BASE}/exp-9` },
		});
	});

describe("useExperienceForm", () => {
	beforeEach(() => navigateMock.mockReset());

	// Both come from text inputs; the columns are numeric. The schema's
	// transform is the only thing converting them.
	it("converts the cutoff and price from strings to numbers", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body.mock.calls[0][0]).toMatchObject({
			bookingCutoffHours: 24,
			startingPrice: 95,
		});
	});

	// The media refs live in the form like any other field, so they must reach
	// the payload — the picker writes them, nothing else does.
	it("carries the media refs through", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, {
			...VALID,
			thumbnailMediaId: "m-1",
			mediaIds: ["m-1", "m-2"],
		});

		expect(body.mock.calls[0][0]).toMatchObject({
			thumbnailMediaId: "m-1",
			mediaIds: ["m-1", "m-2"],
		});
	});

	// The column's own check is `starting_price > 0`, so a zero is refused by
	// the database itself. Catching it here beats an opaque 422 on save — which
	// is what an operator got for every edit until this field existed.
	it.each([
		"0",
		"-1",
		"abc",
		"",
	])("rejects the starting price %s before the network", async (startingPrice) => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, { ...VALID, startingPrice });

		expect(body).not.toHaveBeenCalled();
	});

	// An opaque 422 is worse than a message beside the field.
	it.each([
		"-5",
		"abc",
	])("rejects the cutoff %s before the network", async (bookingCutoffHours) => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, { ...VALID, bookingCutoffHours });

		expect(body).not.toHaveBeenCalled();
	});
});
