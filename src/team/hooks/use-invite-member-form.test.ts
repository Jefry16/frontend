import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useInviteMemberForm } from "./use-invite-member-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn(), updated: vi.fn() },
}));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const BASE = `${API}/tour-operators/${OP}/invitations`;

type FieldName = "name" | "email" | "role";

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useInviteMemberForm(OP), { wrapper: Wrapper });
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

describe("useInviteMemberForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the invite and lands on the new invitation's detail", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, async ({ request }) => {
				body(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `/api/tour-operators/${OP}/invitations/inv-9` },
				});
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "  Ada  ",
			email: "ada@example.com",
			role: "ADMIN",
		});

		expect(body).toHaveBeenCalledWith({
			name: "Ada",
			email: "ada@example.com",
			role: "ADMIN",
		});
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
			params: { tourOperatorId: OP, invitationId: "inv-9" },
		});
	});

	// OWNER moves only by transfer, never by invitation — the backend 422s it.
	// The enum is what stops the form offering a role that cannot be granted.
	it("refuses to send OWNER as an invite role", async () => {
		const body = vi.fn();
		server.use(
			http.post(BASE, () => {
				body();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { result } = render();

		await submit(result.current.form, {
			name: "Ada",
			email: "ada@example.com",
			role: "OWNER",
		});

		expect(body).not.toHaveBeenCalled();
	});

	// 409 means already a member or already invited — actionable, so it is named
	// rather than collapsed into the generic failure.
	it("distinguishes a duplicate invite from any other failure", async () => {
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 409 })));
		const { result: dup } = render();
		await submit(dup.current.form, {
			name: "Ada",
			email: "ada@example.com",
			role: "STAFF",
		});
		const duplicate = dup.current.errorMessage;

		server.resetHandlers();
		server.use(http.post(BASE, () => new HttpResponse(null, { status: 500 })));
		const { result: other } = render();
		await submit(other.current.form, {
			name: "Ada",
			email: "ada@example.com",
			role: "STAFF",
		});

		expect(duplicate).toBeTruthy();
		expect(other.current.errorMessage).not.toBe(duplicate);
	});
});
