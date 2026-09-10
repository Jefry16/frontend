import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser, TourOperatorSummary } from "#/auth";
import { wrapperWithProviders } from "#/test/test-utils";
import { usePermissions } from "./use-permissions";

const OP = "op-1";

const { paramsMock } = vi.hoisted(() => ({
	paramsMock: vi.fn(
		() => ({ tourOperatorId: OP }) as { tourOperatorId?: string },
	),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => paramsMock(),
		useNavigate: () => vi.fn(),
	};
});

const operator = (role: TourOperatorSummary["role"]): TourOperatorSummary => ({
	id: OP,
	name: "Acme Tours",
	logoUrl: null,
	timezone: "Europe/Madrid",
	currency: "EUR",
	isDefault: true,
	role,
});

const user = (...operators: TourOperatorSummary[]): AuthUser => ({
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: operators,
});

const permissionsFor = (u: AuthUser) => {
	const { Wrapper } = wrapperWithProviders({ user: u });
	return renderHook(() => usePermissions(), { wrapper: Wrapper }).result
		.current;
};

describe("usePermissions", () => {
	it("grants writes to OWNER and ADMIN, not STAFF", () => {
		expect(permissionsFor(user(operator("OWNER"))).canWrite).toBe(true);
		expect(permissionsFor(user(operator("ADMIN"))).canWrite).toBe(true);
		expect(permissionsFor(user(operator("STAFF"))).canWrite).toBe(false);
	});

	it("reserves isOwner for OWNER — the backend's single ensureOwner case", () => {
		expect(permissionsFor(user(operator("OWNER"))).isOwner).toBe(true);
		expect(permissionsFor(user(operator("ADMIN"))).isOwner).toBe(false);
		expect(permissionsFor(user(operator("STAFF"))).isOwner).toBe(false);
	});

	it("denies when the route's operator is not one the user belongs to", () => {
		const elsewhere: TourOperatorSummary = {
			...operator("OWNER"),
			id: "other-op",
		};
		expect(permissionsFor(user(elsewhere))).toEqual({
			canWrite: false,
			isOwner: false,
		});
	});

	it("denies off an operator route, where there is no role to read", () => {
		paramsMock.mockReturnValueOnce({});
		expect(permissionsFor(user(operator("OWNER")))).toEqual({
			canWrite: false,
			isOwner: false,
		});
	});
});
