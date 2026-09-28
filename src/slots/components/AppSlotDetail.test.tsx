import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "#/auth";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import type { Slot } from "../types";
import { AppSlotDetail } from "./AppSlotDetail";

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
const ID = "slot-1";

const slot: Slot = {
	id: ID,
	context: "slots",
	experienceId: "exp-1",
	experienceName: "Buggies",
	experienceDescription: "Mud",
	startAt: "2026-10-09T09:00:00",
	endAt: "2026-10-09T13:00:00",
	day: 5,
	durationMinutes: 240,
	status: "AVAILABLE",
	audiencePrices: [
		{
			audienceId: "a",
			audienceName: "Adult",
			price: 129,
			capacity: 12,
			paxPerUnit: 1,
			bookedCount: 7,
		},
	],
};

const owner: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [
		{
			id: OP,
			name: "Acme Tours",
			logoUrl: null,
			timezone: "Europe/Madrid",
			currency: "EUR",
			isDefault: true,
			role: "OWNER",
		},
	],
};

describe("AppSlotDetail", () => {
	it("prices each tier with its capacity and what is booked", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/slots/${ID}`, () =>
				HttpResponse.json(slot),
			),
			http.get(`${API}/tour-operators/${OP}/audit-log`, () =>
				HttpResponse.json({ data: [], nextCursor: null }),
			),
		);
		renderWithProviders(<AppSlotDetail tourOperatorId={OP} slotId={ID} />, {
			user: owner,
		});

		const row = await screen.findByRole("row", { name: /adult/i });
		expect(row).toHaveTextContent("€129.00");
		expect(row).toHaveTextContent("12");
		expect(row).toHaveTextContent("7");
	});
});
