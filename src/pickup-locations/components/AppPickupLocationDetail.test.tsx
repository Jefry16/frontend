import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "#/auth";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppPickupLocationDetail } from "./AppPickupLocationDetail";

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
const ID = "pl-1";

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

describe("AppPickupLocationDetail", () => {
	it("lists what each audience pays to board, in the operator's currency", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/pickup-locations/${ID}`, () =>
				HttpResponse.json({
					id: ID,
					context: "pickup-locations",
					name: "Harbour gate",
					time: "08:30:00",
					createdAt: "2026-01-01T00:00:00Z",
					audiencePrices: [
						{ audienceId: "a", audienceName: "Adult", price: 12.5 },
						{ audienceId: "i", audienceName: "Infant", price: 0 },
					],
				}),
			),
		);
		renderWithProviders(
			<AppPickupLocationDetail tourOperatorId={OP} pickupLocationId={ID} />,
			{ user: owner },
		);

		expect(
			await screen.findByRole("row", { name: /adult/i }),
		).toHaveTextContent("€12.50");
		expect(screen.getByRole("row", { name: /infant/i })).toHaveTextContent(
			"€0.00",
		);
	});
});
