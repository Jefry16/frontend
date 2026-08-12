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

	// THE branch. `accessToken` present means the backend provisioned a new
	// account and issued it a session; the invitee is not signed in and has no
	// other way to become so. Refreshing a profile that does not exist instead
	// would leave them authenticated as nobody, on an operator page.
	it("adopts the issued session when a new account was provisioned", async () => {
		server.use(accepts("fresh-token"));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(establishSession).toHaveBeenCalledWith("fresh-token");
		expect(refreshUser).not.toHaveBeenCalled();
	});

	// The mirror: an already-signed-in accepter has an identity. Adopting a
	// session here would be adopting `null`.
	it("refreshes the profile when the accepter already had an account", async () => {
		server.use(accepts(null));
		const { result } = render();

		await act(async () => {
			result.current.acceptAsCurrentUser();
		});

		expect(refreshUser).toHaveBeenCalled();
		expect(establishSession).not.toHaveBeenCalled();
	});

	// The one-click path sends NO body — the caller's own account is the
	// identity. A form payload here would try to provision a second account.
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

	// Lands in the operator that was joined, using the id the accept returned —
	// there is no other source for it on this page.
	it("navigates into the operator it just joined", async () => {
		server.use(accepts("fresh-token"));
		const { result } = render();

		await submitForm(result.current.form, VALID);

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/tour-operators/$tourOperatorId",
			params: { tourOperatorId: OP },
		});
	});

	// Four rejections an invitee resolves four different ways: sign in instead,
	// use the invited address, ask for a new invite, check the link. Collapsing
	// them to one message sends people down the wrong path.
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
