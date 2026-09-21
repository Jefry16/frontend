import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { Experience } from "../types";
import { useExperienceForm } from "./use-experience-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

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
	| "mediaIds"
	| "categoryId";

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

	it("carries the category through, and defaults to none", async () => {
		const body = vi.fn();
		server.use(created(body));
		const { result: withoutCategory } = render();
		await submit(withoutCategory.current.form, VALID);
		expect(body.mock.calls[0][0]).toMatchObject({ categoryId: null });

		const { result: withCategory } = render();
		await submit(withCategory.current.form, { ...VALID, categoryId: "cat-1" });
		expect(body.mock.calls[1][0]).toMatchObject({ categoryId: "cat-1" });
	});

	it("an edit keeps the experience's category, which the backend sends as a nested ref", async () => {
		const body = vi.fn();
		server.use(
			http.patch(`${BASE}/exp-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const existing = {
			id: "exp-1",
			name: "Sunset Sailing",
			description: "An evening on the water",
			longDescription: "<p>Longer</p>",
			featured: false,
			bookingCutoffHours: 24,
			startingPrice: 95,
			mediaIds: [],
			thumbnailMediaId: null,
			seoTitle: null,
			seoDescription: null,
			category: {
				id: "cat-1",
				context: "categories",
				name: "Sailing",
				handle: "sailing",
			},
		} as unknown as Experience;
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useExperienceForm(OP, existing), {
			wrapper: Wrapper,
		});

		expect(result.current.form.state.values.categoryId).toBe("cat-1");
		await submit(result.current.form, {});
		expect(body.mock.calls[0][0]).toMatchObject({ categoryId: "cat-1" });
	});

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
