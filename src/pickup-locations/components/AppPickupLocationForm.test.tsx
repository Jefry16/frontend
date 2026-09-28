import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppPickupLocationForm } from "./AppPickupLocationForm";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useNavigate: () => vi.fn(),
		Link: ({ to, ...rest }: ComponentProps<"a"> & { to?: string }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

describe("AppPickupLocationForm", () => {
	it("prices the audiences by name, whatever order the list answers", async () => {
		server.use(
			http.get(`${API}/tour-operators/${OP}/audiences`, () =>
				HttpResponse.json({
					data: [
						{ id: "z", context: "audiences", name: "Zeta", paxPerUnit: 1 },
						{ id: "a", context: "audiences", name: "Alpha", paxPerUnit: 1 },
						{ id: "m", context: "audiences", name: "Mid", paxPerUnit: 1 },
					],
					nextCursor: null,
				}),
			),
		);
		renderWithProviders(<AppPickupLocationForm tourOperatorId={OP} />);

		await waitFor(() =>
			expect(screen.getByLabelText("Alpha")).toBeInTheDocument(),
		);
		const labels = screen
			.getAllByRole("textbox")
			.filter((el) => el.id.startsWith("pickup-price-"))
			.map((el) => el.id.slice("pickup-price-".length));
		expect(labels).toEqual(["a", "m", "z"]);
	});
});
