import { screen } from "@testing-library/react";
import { Languages, Pencil, Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { type AppAction, AppPageActions } from "./AppPageActions";

// Editing is ADMIN+; reading the translations is member-visible.
const mixedTiers = (): AppAction[] => [
	{ id: "edit", label: "Edit", icon: Pencil, onSelect: vi.fn() },
	{
		id: "translations",
		label: "Translations",
		icon: Languages,
		member: true,
		onSelect: vi.fn(),
	},
	{
		id: "delete",
		label: "Delete",
		icon: Trash2,
		variant: "destructive",
		onSelect: vi.fn(),
	},
];

describe("AppPageActions", () => {
	it("hides ADMIN+ actions from a member and keeps the member one", () => {
		renderWithProviders(
			<AppPageActions actions={mixedTiers()} canWrite={false} />,
		);

		expect(
			screen.getByRole("button", { name: "Translations" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
		// The sole survivor takes the primary slot, so there is no overflow menu.
		expect(screen.queryByRole("button", { name: /more/i })).toBeNull();
	});

	it("renders nothing when the member may run none of them", () => {
		const { container } = renderWithProviders(
			<AppPageActions
				actions={mixedTiers().filter((a) => !a.member)}
				canWrite={false}
			/>,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("gives an ADMIN+ the full set, destructive still out of the primary slot", () => {
		renderWithProviders(<AppPageActions actions={mixedTiers()} canWrite />);

		// First non-destructive action is primary; the rest go to the overflow.
		expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
		expect(screen.getByRole("button", { name: /more/i })).toBeInTheDocument();
	});
});
