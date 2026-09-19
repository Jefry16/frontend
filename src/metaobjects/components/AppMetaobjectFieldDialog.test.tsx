import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import type { MetaobjectField } from "../types";
import { AppMetaobjectFieldDialog } from "./AppMetaobjectFieldDialog";

const colour: MetaobjectField = {
	key: "colour",
	type: "single_line_text",
	name: "Colour",
};
const size: MetaobjectField = {
	key: "size",
	type: "single_line_text",
	name: "Size",
};

const dialog = (open: boolean, field?: MetaobjectField) => (
	<AppMetaobjectFieldDialog
		open={open}
		onOpenChange={() => {}}
		field={field}
		pending={false}
		errorMessage={null}
		onSubmit={() => {}}
	/>
);

const nameInput = () => screen.getByRole("textbox", { name: /name/i });

describe("AppMetaobjectFieldDialog", () => {
	it("opens a rename on the field's current name, whichever field it is", () => {
		const { rerender } = renderWithProviders(dialog(false, colour));

		rerender(dialog(true, colour));
		expect(nameInput()).toHaveValue("Colour");

		rerender(dialog(false, colour));
		rerender(dialog(true, size));
		expect(nameInput()).toHaveValue("Size");
	});

	it("drops an unsaved add draft when the dialog closes", async () => {
		const user = userEvent.setup();
		const { rerender } = renderWithProviders(dialog(true));

		await user.type(nameInput(), "Waist");
		expect(nameInput()).toHaveValue("Waist");

		rerender(dialog(false));
		rerender(dialog(true));
		expect(nameInput()).toHaveValue("");
	});
});
