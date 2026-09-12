import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProvider } from "@vointika/ui";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "#/auth";
import { getAccessToken } from "#/lib/tokens";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppSignOutButton } from "./AppSignOutButton";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

describe("AppSignOutButton", () => {
	beforeEach(() => navigateMock.mockReset());

	it("clears the session and sends the user to login", async () => {
		server.use(
			http.post(
				`${API}/auth/logout`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);
		renderWithProviders(
			<SidebarProvider>
				<AppSignOutButton />
			</SidebarProvider>,
			{ user: USER },
		);

		expect(getAccessToken()).not.toBeNull();
		await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

		await waitFor(() => expect(getAccessToken()).toBeNull());
		expect(navigateMock).toHaveBeenCalledWith({ to: "/auth/login" });
	});

	it("still signs out locally when the endpoint fails", async () => {
		server.use(http.post(`${API}/auth/logout`, () => HttpResponse.error()));
		renderWithProviders(
			<SidebarProvider>
				<AppSignOutButton />
			</SidebarProvider>,
			{ user: USER },
		);

		await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

		await waitFor(() => expect(getAccessToken()).toBeNull());
		expect(navigateMock).toHaveBeenCalledWith({ to: "/auth/login" });
	});
});
