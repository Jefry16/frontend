import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { renderWithProviders } from "#/test/test-utils";
import { AppDialogFooter } from "./AppDialogFooter";

const render = (props: Partial<Parameters<typeof AppDialogFooter>[0]> = {}) =>
	renderWithProviders(
		<Dialog open>
			<DialogContent>
				<DialogTitle>Rename</DialogTitle>
				<AppDialogFooter onConfirm={vi.fn()} {...props} />
			</DialogContent>
		</Dialog>,
	);

describe("AppDialogFooter", () => {
	// Seven dialogs disagreed about this before: only one disabled Cancel while
	// a save was running, so the rest let you close the dialog mid-request.
	it("disables both buttons while pending", () => {
		render({ pending: true });
		expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
	});

	it("disables only the confirm when the form is invalid or unchanged", () => {
		render({ disabled: true });
		expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
		expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
	});
});
