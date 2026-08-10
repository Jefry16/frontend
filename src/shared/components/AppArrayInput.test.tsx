import type { AnyFieldApi } from "@tanstack/react-form";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppArrayInput } from "./AppArrayInput";

// A stand-in for the slice of AnyFieldApi this component reads. Building a real
// TanStack form would test TanStack; what needs pinning is which calls this
// component makes and with what.
const fieldStub = (items: string[]) => {
	const handleChange = vi.fn();
	return {
		field: {
			name: "highlights",
			state: {
				value: items,
				meta: { isTouched: false, errors: [] },
			},
			handleChange,
			handleBlur: vi.fn(),
		} as unknown as AnyFieldApi,
		handleChange,
	};
};

const render = (items: string[] = []) => {
	const { field, handleChange } = fieldStub(items);
	renderWithProviders(<AppArrayInput field={field} label="Highlights" />);
	return { handleChange, input: screen.getByLabelText("Highlights") };
};

describe("AppArrayInput", () => {
	it("adds the typed entry on Enter", async () => {
		const user = userEvent.setup();
		const { handleChange, input } = render();

		await user.type(input, "Sunset{Enter}");

		expect(handleChange).toHaveBeenCalledWith(["Sunset"]);
	});

	it("trims before adding", async () => {
		const user = userEvent.setup();
		const { handleChange, input } = render();

		await user.type(input, "  Sunset  {Enter}");

		expect(handleChange).toHaveBeenCalledWith(["Sunset"]);
	});

	// Silently, and the input still clears — the entry is already in the list,
	// so re-typing it is a no-op rather than an error worth reporting.
	it("refuses a duplicate without calling the field", async () => {
		const user = userEvent.setup();
		const { handleChange, input } = render(["Sunset"]);

		await user.type(input, "Sunset{Enter}");

		expect(handleChange).not.toHaveBeenCalled();
		expect(input).toHaveValue("");
	});

	it("ignores Enter on an empty or whitespace-only input", async () => {
		const user = userEvent.setup();
		const { handleChange, input } = render(["Sunset"]);

		await user.type(input, "{Enter}");
		await user.type(input, "   {Enter}");

		expect(handleChange).not.toHaveBeenCalled();
	});

	// Enter inside a form would submit it. This component lives in create and
	// edit forms, so adding a chip must not save the record.
	it("prevents the Enter keypress from reaching the form", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
		const { field } = fieldStub([]);
		renderWithProviders(
			<form onSubmit={onSubmit}>
				<AppArrayInput field={field} label="Highlights" />
			</form>,
		);

		await user.type(screen.getByLabelText("Highlights"), "Sunset{Enter}");

		expect(onSubmit).not.toHaveBeenCalled();
	});

	// Backspace only reaches the chips once the input is empty, so a normal
	// correction inside the text never deletes an entry behind it.
	it("removes the last chip on Backspace only when the input is empty", async () => {
		const user = userEvent.setup();
		const { handleChange, input } = render(["Sunset", "Small group"]);

		await user.type(input, "x");
		await user.type(input, "{Backspace}");
		expect(handleChange).not.toHaveBeenCalled();

		await user.type(input, "{Backspace}");
		expect(handleChange).toHaveBeenCalledWith(["Sunset"]);
	});

	it("removes the chip whose remove button is pressed", async () => {
		const user = userEvent.setup();
		const { handleChange } = render(["Sunset", "Small group"]);

		await user.click(screen.getByRole("button", { name: /Sunset/ }));

		expect(handleChange).toHaveBeenCalledWith(["Small group"]);
	});
});
