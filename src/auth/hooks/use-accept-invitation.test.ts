import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useAcceptInvitation } from "./use-accept-invitation";

const { navigateMock, establishSession, refreshUser } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	establishSession: vi.fn(),
	refreshUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("../AuthProvider", () => ({
	useAuth: () => ({ establishSession, refreshUser }),
}));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const TOKEN = "invite-token-abc";
const URL_ = `${API}/invitations/${TOKEN}/accept`;
const OP = "op-9";

type FieldName = "name" | "password";

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useAcceptInvitation(TOKEN), { wrapper: Wrapper });
};

const accepts = (accessToken: string | null, body?: ReturnType<typeof vi.fn>) =>
	http.post(URL_, async ({ request }) => {
		body?.(await request.json());
		return HttpResponse.json({
			id: OP,
			context: "tour-operators",
			operatorName: "Acme Tours",
			accessToken,
		});
	});

const submitForm = async (
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

const VALID = { name: "Ada Lovelace", password: "Passw0rd!23" };

describe("useAcceptInvitation", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		establishSession.mockReset();
		refreshUser.mockReset();
	});

	it("adopts the issued session when a new account was provisioned", async () => {
		server.use(accepts("fresh-token"));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(establishSession).toHaveBeenCalledWith("fresh-token");
		expect(refreshUser).not.toHaveBeenCalled();
	});

	it("refreshes the profile when the accepter already had an account", async () => {
		server.use(accepts(null));
		const { result } = render();

		await act(async () => {
			result.current.acceptAsCurrentUser();
		});

		expect(refreshUser).toHaveBeenCalled();
		expect(establishSession).not.toHaveBeenCalled();
	});

	it("sends an empty body for the authenticated one-click accept", async () => {
		const body = vi.fn();
		server.use(accepts(null, body));
		const { result } = render();

		await act(async () => {
			result.current.acceptAsCurrentUser();
		});

		expect(body).toHaveBeenCalledWith({});
	});

	it("sends the name and password on the anonymous path", async () => {
		const body = vi.fn();
		server.use(accepts("fresh-token", body));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(body).toHaveBeenCalledWith(VALID);
	});

	it("navigates into the operator it just joined", async () => {
		server.use(accepts("fresh-token"));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId",
			params: { tourOperatorId: OP },
		});
	});

	it.each([409, 403, 410, 404])("gives %i its own message", async (status) => {
		server.use(http.post(URL_, () => new HttpResponse(null, { status })));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(result.current.errorMessage).toBeTruthy();
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("keeps the four rejections distinct from each other", async () => {
		const messages = new Set<string>();
		for (const status of [409, 403, 410, 404, 500]) {
			server.resetHandlers();
			server.use(http.post(URL_, () => new HttpResponse(null, { status })));
			const { result } = render();
			await submitForm(result.current.form, VALID);
			messages.add(result.current.errorMessage ?? "");
		}

		expect(messages.size).toBe(5);
	});

	it("does not reach the network when the form is invalid", async () => {
		const body = vi.fn();
		server.use(accepts("fresh-token", body));
		const { result } = render();

		await submitForm(result.current.form, { ...VALID, name: "A" });

		expect(body).not.toHaveBeenCalled();
	});
});
