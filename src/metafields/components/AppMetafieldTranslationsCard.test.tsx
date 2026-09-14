import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { allPagesKey } from "@vointika/ui";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { queryKeys } from "#/lib/query-keys";
import { server } from "#/test/server";
import { createTestQueryClient, renderWithProviders } from "#/test/test-utils";
import type { MetafieldDefinitionListItem, MetafieldValue } from "../types";
import { AppMetafieldTranslationsCard } from "./AppMetafieldTranslationsCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const OWNER = "e-1";
const LOCALE = "es";
const OWNER_PATH = `${API}/tour-operators/${OP}/metafield-translations/experience/${OWNER}`;
const ENDPOINT = `${OWNER_PATH}/${LOCALE}`;

const definition = (
	key: string,
	type: MetafieldDefinitionListItem["type"],
	name: string,
): MetafieldDefinitionListItem => ({
	id: `d-${key}`,
	context: "metafield-definitions",
	ownerType: "experience",
	namespace: "custom",
	key,
	type,
	metaobjectDefinitionId: null,
	name,
	createdAt: "2026-07-20T10:00:00Z",
});

const DEFINITIONS = [
	definition("difficulty", "single_line_text", "Difficulty"),
	definition("notes", "multi_line_text", "Notes"),
	definition("altitude", "number_integer", "Altitude"),
];

const VALUES: MetafieldValue[] = [
	{
		namespace: "custom",
		key: "difficulty",
		type: "single_line_text",
		name: "Difficulty",
		value: "Moderate",
		updatedAt: "2026-07-22T10:00:00Z",
	},
];

const renderCard = (overlay: Record<string, string>) => {
	const qc = createTestQueryClient();
	qc.setQueryData(
		allPagesKey(
			queryKeys.metafieldDefinitions(OP),
			`/tour-operators/${OP}/metafield-definitions`,
		),
		DEFINITIONS,
	);
	qc.setQueryData(queryKeys.metafieldValues(OP, "experience", OWNER), VALUES);
	qc.setQueryData(
		queryKeys.metafieldTranslation(OP, "experience", OWNER, LOCALE),
		overlay,
	);
	return renderWithProviders(
		<AppMetafieldTranslationsCard
			tourOperatorId={OP}
			ownerType="experience"
			ownerId={OWNER}
			locale={LOCALE}
			canWrite
		/>,
		{ queryClient: qc },
	);
};

describe("AppMetafieldTranslationsCard", () => {
	let body: unknown;

	beforeEach(() => {
		body = undefined;
		server.use(
			http.put(ENDPOINT, async ({ request }) => {
				body = await request.json();
				return new HttpResponse(null, { status: 204 });
			}),
			http.get(
				`${API}/tour-operators/${OP}/metafields/experience/${OWNER}`,
				() => HttpResponse.json(VALUES),
			),
			http.get(OWNER_PATH, () => HttpResponse.json([LOCALE])),
			http.get(ENDPOINT, () => HttpResponse.json({})),
		);
	});

	it("offers an input only for the translatable types", () => {
		renderCard({});
		expect(screen.getByLabelText(/Difficulty/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
		expect(screen.queryByLabelText(/Altitude/)).not.toBeInTheDocument();
	});

	it("sends only the edited key, leaving the untouched one alone", async () => {
		const user = userEvent.setup();
		renderCard({
			"custom.difficulty": "Moderado",
			"custom.notes": "Traer agua",
		});

		await user.clear(screen.getByLabelText(/Difficulty/));
		await user.type(screen.getByLabelText(/Difficulty/), "Fácil");
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() => expect(body).toBeDefined());
		expect(body).toEqual({ values: { "custom.difficulty": "Fácil" } });
	});

	it("sends a cleared box as a blank string rather than omitting it", async () => {
		const user = userEvent.setup();
		renderCard({ "custom.difficulty": "Moderado" });

		await user.clear(screen.getByLabelText(/Difficulty/));
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() => expect(body).toBeDefined());
		expect(body).toEqual({ values: { "custom.difficulty": "" } });
	});
});
