import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { bookingInUsd, operatorInEur } from "../fixtures";
import { AppBookingsList } from "./AppBookingsList";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => ({ tourOperatorId: "op-1" }),
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

describe("AppBookingsList", () => {
	it("totals each booking in the currency its order was paid in, not the operator's today", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/bookings`, () =>
				HttpResponse.json({ data: [bookingInUsd], nextCursor: null }),
			),
		);
		renderWithProviders(<AppBookingsList tourOperatorId={OP} />, {
			user: operatorInEur,
		});

		const row = await screen.findByRole(
			"row",
			{ name: /#1001-1/ },
			{ timeout: 5000 },
		);
		expect(row).toHaveTextContent("$338.00");
		expect(row).not.toHaveTextContent("€");
	});
});
