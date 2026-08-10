import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePageForm } from "./use-page-form";

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
const BASE = `${API}/tour-operators/${OP}/pages`;

const EXISTING = {
	id: "page-1",
	context: "pages",
	title: "About",
	handle: "about-us",
	body: "<p>Old</p>",
	seoTitle: null,
	seoDescription: null,
	status: "DRAFT",
};

type FieldName = "title" | "handle" | "body" | "seoTitle" | "seoDescription";

const render = (page?: typeof EXISTING) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => usePageForm(OP, page as never), { wrapper: Wrapper });
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

describe("usePageForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the operator-chosen handle on create", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `${BASE}/page-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			title: "Contact",
			handle: "contact",
			body: "<p>Hi</p>",
		});

		expect(body.mock.calls[0][0]).toMatchObject({
			title: "Contact",
			handle: "contact",
		});
	});

	// Renaming a handle moves the page's public address, so it is a separate
	// deliberate action. An edit that sent one would move it silently.
	it("never sends the handle on edit", async () => {
		const body = vi.fn();
		server.use(
			http.patch(`${BASE}/page-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, { title: "About us" });

		expect(body.mock.calls[0][0]).not.toHaveProperty("handle");
		expect(body.mock.calls[0][0]).toMatchObject({ title: "About us" });
	});

	it("collapses blank SEO fields to null", async () => {
		const body = vi.fn();
		server.use(
			http.patch(`${BASE}/page-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, {
			title: "About",
			seoTitle: "  ",
			seoDescription: "",
		});

		expect(body.mock.calls[0][0].seoTitle).toBeNull();
		expect(body.mock.calls[0][0].seoDescription).toBeNull();
	});

	// A taken handle is fixable by choosing another; anything else is not.
	it("names a taken handle rather than reporting a generic failure", async () => {
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 409 })));
		const { result: taken } = render();
		await submit(taken.current.form, {
			title: "Contact",
			handle: "contact",
			body: "<p>Hi</p>",
		});
		const conflict = taken.current.errorMessage;

		server.resetHandlers();
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 500 })));
		const { result: other } = render();
		await submit(other.current.form, {
			title: "Contact",
			handle: "contact",
			body: "<p>Hi</p>",
		});

		expect(conflict).toBeTruthy();
		expect(other.current.errorMessage).not.toBe(conflict);
	});
});
