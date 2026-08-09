import { screen } from "@testing-library/react";
import { Languages, Pencil, Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { type AppAction, AppPageActions } from "./AppPageActions";

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

		expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
		expect(screen.getByRole("button", { name: /more/i })).toBeInTheDocument();
	});

	// The case above cannot see this rule: its first action is already
	// non-destructive, so "first non-destructive" and "first" agree and a broken
	// pick still passes. Here the destructive one leads the array, so only the
	// rule keeps it out of the primary slot.
	it("skips a leading destructive action when picking the primary", () => {
		renderWithProviders(
			<AppPageActions
				actions={[
					{
						id: "delete",
						label: "Delete",
						variant: "destructive",
						onSelect: vi.fn(),
					},
					{ id: "edit", label: "Edit", onSelect: vi.fn() },
				]}
				canWrite
			/>,
		);

		expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
	});

	// The fallback: nothing non-destructive to promote, so the first leads
	// rather than the component rendering no primary button at all.
	it("falls back to the first action when every one is destructive", () => {
		renderWithProviders(
			<AppPageActions
				actions={[
					{
						id: "delete",
						label: "Delete",
						variant: "destructive",
						onSelect: vi.fn(),
					},
					{
						id: "purge",
						label: "Purge",
						variant: "destructive",
						onSelect: vi.fn(),
					},
				]}
				canWrite
			/>,
		);

		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});
});
