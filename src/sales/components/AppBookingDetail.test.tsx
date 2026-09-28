import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { bookingInUsd, operatorInEur } from "../fixtures";
import { AppBookingDetail } from "./AppBookingDetail";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => ({ tourOperatorId: "op-1" }),
		useNavigate: () => vi.fn(),
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "bk-1";

describe("AppBookingDetail", () => {
	it("prices the booking in the currency its order was paid in, not the operator's today", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/bookings/${ID}`, () =>
				HttpResponse.json(bookingInUsd),
			),
		);
		renderWithProviders(
			<AppBookingDetail tourOperatorId={OP} bookingId={ID} />,
			{
				user: operatorInEur,
			},
		);

		const row = await screen.findByRole("row", { name: /adult/i });
		expect(row).toHaveTextContent("$169.00");
		expect(row).toHaveTextContent("$338.00");
		expect(screen.queryByText(/€/)).toBeNull();
	});
});
