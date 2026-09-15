import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import type { Category } from "../types";
import { useCategoryForm } from "./use-category-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/categories`;

const EXISTING: Category = {
	id: "cat-1",
	context: "categories",
	name: "Boat trips",
	handle: "boat-trips",
	createdAt: "2026-01-01T00:00:00Z",
};

const conflict = () =>
	HttpResponse.json(
		{ status: 409, error: "Conflict", message: "already exists" },
		{ status: 409 },
	);

const render = (existing?: Category) => {
	const { Wrapper, queryClient } = wrapperWithProviders();
	const spy = vi.spyOn(queryClient, "invalidateQueries");
	const hook = renderHook(() => useCategoryForm(OP, existing), {
		wrapper: Wrapper,
	});
	return {
		...hook,
		invalidated: () => spy.mock.calls.map((call) => call[0]?.queryKey),
	};
};

const submit = async (
	form: {
		setFieldValue: (n: "name", v: never) => void;
		handleSubmit: () => Promise<void>;
	},
	name: string,
) => {
	act(() => form.setFieldValue("name", name as never));
	await act(async () => {
		await form.handleSubmit();
	});
};

describe("useCategoryForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the trimmed name, then goes to the detail built from Location", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `/api/tour-operators/${OP}/categories/cat-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, "  Boat trips  ");

		expect(body).toHaveBeenCalledWith({ name: "Boat trips" });
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId/categories/$categoryId",
			params: { tourOperatorId: OP, categoryId: "cat-9" },
		});
	});

	it("refreshes the list and the trail on create, but no detail that was never read", async () => {
		server.use(
			http.post(
				BASE,
				() =>
					new HttpResponse(null, {
						status: 201,
						headers: { Location: `/api/tour-operators/${OP}/categories/cat-9` },
					}),
			),
		);
		const { result, invalidated } = render();

		await submit(result.current.form, "Boat trips");

		expect(invalidated()).toEqual([
			["categories", OP],
			["activity", OP],
		]);
	});

	it("patches the existing record on edit rather than creating a second", async () => {
		const patched = vi.fn();
		const posted = vi.fn();
		server.use(
			http.patch(`${BASE}/cat-1`, async ({ request }) => {
				patched(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
			http.post(BASE, () => {
				posted();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result, invalidated } = render(EXISTING);

		await submit(result.current.form, "Boat tours");

		expect(patched).toHaveBeenCalledWith({ name: "Boat tours" });
		expect(posted).not.toHaveBeenCalled();
		expect(invalidated()).toEqual([
			["categories", OP, "cat-1"],
			["categories", OP],
			["activity", OP],
		]);
	});

	it("words the conflict differently for create and for edit", async () => {
		server.use(
			http.post(BASE, conflict),
			http.patch(`${BASE}/cat-1`, conflict),
		);

		const created = render();
		await submit(created.result.current.form, "Boat trips");

		const edited = render(EXISTING);
		await submit(edited.result.current.form, "Boat trips");

		expect(created.result.current.errorMessage).toBeTruthy();
		expect(edited.result.current.errorMessage).toBeTruthy();
		expect(created.result.current.errorMessage).not.toEqual(
			edited.result.current.errorMessage,
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
