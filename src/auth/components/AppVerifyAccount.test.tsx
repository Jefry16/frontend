import { screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppVerifyAccount } from "./AppVerifyAccount";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

describe("AppVerifyAccount", () => {
	it("a link already used reads as verified, and says the account already was", () => {
		renderWithProviders(<AppVerifyAccount state="already-verified" />);
		expect(screen.getByText("Email verified")).toBeInTheDocument();
		expect(
			screen.getByText("This account was already verified. You can sign in."),
		).toBeInTheDocument();
	});

	it("a lapsed link says it expired, not that it is invalid", () => {
		renderWithProviders(<AppVerifyAccount state="expired" />);
		expect(
			screen.getByText(
				"This verification link has expired. Sign in to request a new one.",
			),
		).toBeInTheDocument();
		expect(screen.queryByText(/invalid or has expired/)).toBeNull();
	});
});
