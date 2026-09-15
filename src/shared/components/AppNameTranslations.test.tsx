import { screen, waitFor } from "@testing-library/react";
import type { QueryState } from "@vointika/ui";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import * as m from "#/paraglide/messages";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import { AppNameTranslations } from "./AppNameTranslations";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const AUDIENCE = "a-1";
const BASE = `${API}/tour-operators/${OP}/audiences/${AUDIENCE}/translations`;

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		Link: ({ children }: { children: React.ReactNode }) => (
			<a href="/">{children}</a>
		),
		useParams: () => ({ tourOperatorId: OP }),
	};
});

const localesSettled: QueryState<unknown> = {
	data: {},
	isPending: false,
	error: null,
	refetch: () => {},
};

const renderViewer = (translatable: string[]) =>
	renderWithProviders(
		<AppNameTranslations
			tourOperatorId={OP}
			endpointBase={BASE}
			queryKeyBase={["audience-translations", OP, AUDIENCE]}
			canonicalName="Families"
			maxLength={100}
			translatable={translatable}
			localesQuery={localesSettled}
			localeLabel={(code) => code}
			canWrite={false}
		/>,
	);

describe("AppNameTranslations", () => {
	it("a viewer reads the locale's own overlay, not the row in the list", async () => {
		server.use(
			http.get(BASE, () =>
				HttpResponse.json([{ locale: "es", name: "Stale from the list" }]),
			),
			http.get(`${BASE}/es`, () =>
				HttpResponse.json({ locale: "es", name: "Familias" }),
			),
		);

		renderViewer(["es"]);

		expect(await screen.findByText("Familias")).toBeInTheDocument();
		expect(screen.queryByText("Stale from the list")).not.toBeInTheDocument();
	});

	it("asks for no overlay until there is a locale to ask about", async () => {
		const overlay = vi.fn(() =>
			HttpResponse.json({ locale: "es", name: null }),
		);
		server.use(
			http.get(BASE, () => HttpResponse.json([])),
			http.get(`${BASE}/:locale`, overlay),
		);

		renderViewer([]);

		await waitFor(() =>
			expect(
				screen.getByText(m.translations_no_languages()),
			).toBeInTheDocument(),
		);
		expect(overlay).not.toHaveBeenCalled();
	});
});
