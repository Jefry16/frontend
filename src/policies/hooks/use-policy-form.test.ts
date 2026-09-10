import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePolicyForm } from "./use-policy-form";

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
const BASE = `${API}/tour-operators/${OP}/policies`;

const EXISTING = {
	id: "pol-1",
	context: "policies" as const,
	type: "CANCELLATION",
	title: "Cancellation",
	body: "<p>Old</p>",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
};

type FieldName = "type" | "title" | "body";

const render = (policy?: typeof EXISTING) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => usePolicyForm(OP, policy as never), {
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

describe("usePolicyForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the type on create", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `/api/tour-operators/${OP}/policies/pol-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			type: "PRIVACY",
			title: "Privacy",
			body: "<p>Text</p>",
		});

		expect(body).toHaveBeenCalledWith({
			type: "PRIVACY",
			title: "Privacy",
			body: "<p>Text</p>",
		});
	});

	it("never sends the type on edit, even though the form holds it", async () => {
		const body = vi.fn();
		server.use(
			http.put(`${BASE}/pol-1`, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const { result } = render(EXISTING);

		await submit(result.current.form, { title: "Cancellations" });

		expect(body).toHaveBeenCalledWith({
			title: "Cancellations",
			body: "<p>Old</p>",
		});
		expect(body.mock.calls[0][0]).not.toHaveProperty("type");
	});

	it("distinguishes the one-per-type conflict from other failures", async () => {
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 409 })));
		const { result: dup } = render();
		await submit(dup.current.form, {
			type: "PRIVACY",
			title: "Privacy",
			body: "<p>x</p>",
		});
		const conflict = dup.current.errorMessage;

		server.resetHandlers();
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 500 })));
		const { result: other } = render();
		await submit(other.current.form, {
			type: "PRIVACY",
			title: "Privacy",
			body: "<p>x</p>",
		});

		expect(conflict).toBeTruthy();
		expect(other.current.errorMessage).not.toBe(conflict);
	});
});
