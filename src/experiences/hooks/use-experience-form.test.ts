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
	| "featured"
	| "thumbnailMediaId"
	| "mediaIds";

const VALID: Partial<Record<FieldName, unknown>> = {
	name: "Sunset Sailing",
	description: "An evening on the water",
	longDescription: "<p>Longer</p>",
	bookingCutoffHours: "24",
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

	// The cutoff comes from a text input and the column is an integer; the
	// schema's transform is the only thing converting it.
	it("converts the cutoff from a string to a number", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result } = render();

		await submit(result.current.form, VALID);

		expect(body.mock.calls[0][0]).toMatchObject({ bookingCutoffHours: 24 });
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
