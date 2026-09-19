import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "#/auth";
import { server } from "#/test/server";
import { renderWithProviders } from "#/test/test-utils";
import type { MetaobjectDefinition } from "../types";
import { AppMetaobjectDefinitionDetail } from "./AppMetaobjectDefinitionDetail";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useParams: () => ({ tourOperatorId: "op-1" }),
		useNavigate: () => vi.fn(),
		Link: ({
			to,
			params: _params,
			...rest
		}: ComponentProps<"a"> & { to?: string; params?: unknown }) => (
			<a href={to} {...rest} />
		),
	};
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const ID = "def-1";
const BASE = `${API}/tour-operators/${OP}/metaobject-definitions/${ID}`;
const REASON = "The field is locked while entries are being migrated";

const definition: MetaobjectDefinition = {
	id: ID,
	context: "metaobject-definitions",
	type: "room_type",
	name: "Room type",
	description: null,
	fields: [{ key: "size", type: "single_line_text", name: "Size" }],
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
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

const render = () => {
	server.use(
		http.get(BASE, () => HttpResponse.json(definition)),
		http.get(`${API}/tour-operators/${OP}/metaobjects`, () =>
			HttpResponse.json({ data: [], nextCursor: null }),
		),
		http.patch(`${BASE}/fields/size`, () =>
			HttpResponse.json(
				{ status: 409, error: "Conflict", message: REASON },
				{ status: 409 },
			),
		),
	);
	return renderWithProviders(
		<AppMetaobjectDefinitionDetail tourOperatorId={OP} definitionId={ID} />,
		{ user: owner },
	);
};

describe("AppMetaobjectDefinitionDetail", () => {
	it("names a failed rename in the dialog, and a fresh open starts without it", async () => {
		const user = userEvent.setup();
		render();

		await user.click(await screen.findByRole("button", { name: /^rename$/i }));
		const dialog = await screen.findByRole("dialog");
		await user.type(
			within(dialog).getByRole("textbox", { name: /name/i }),
			"s",
		);
		await user.click(
			within(dialog).getByRole("button", { name: /save changes/i }),
		);
		expect(await within(dialog).findByText(REASON)).toBeVisible();

		await user.keyboard("{Escape}");
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);

		await user.click(screen.getByRole("button", { name: /^rename$/i }));
		const reopened = await screen.findByRole("dialog");
		expect(within(reopened).queryByText(REASON)).not.toBeInTheDocument();
	});
});
