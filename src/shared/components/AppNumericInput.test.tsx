import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppNumericInput } from "./AppNumericInput";

// The gate is a REJECTION, not a transform: a keystroke that fails the pattern
// never reaches onValueChange, so the consumer's value is unchanged and the
// character never appears. Typing is the only way to see that — setting the
// value directly bypasses the very handler under test.
const type = async (text: string, decimal?: boolean) => {
	const onValueChange = vi.fn();
	renderWithProviders(
		<AppNumericInput
			aria-label="amount"
			value=""
			decimal={decimal}
			onValueChange={onValueChange}
		/>,
	);
	await userEvent.type(screen.getByLabelText("amount"), text);
	return onValueChange;
};

describe("AppNumericInput", () => {
	// Two keystrokes, two calls. The value stays "" because nothing here feeds it
	// back, so each character is judged on its own rather than accumulating.
	it("accepts digits", async () => {
		const onValueChange = await type("42");

		expect(onValueChange.mock.calls.flat()).toEqual(["4", "2"]);
	});

	// The value prop is controlled and stays "", so each keystroke is judged on
	// its own. What matters is which characters get through at all.
	it.each([
		"a",
		"-",
		"e",
		"+",
		" ",
		"$",
	])("rejects %s outright", async (char) => {
		const onValueChange = await type(char);

		expect(onValueChange).not.toHaveBeenCalled();
	});

	// `type="number"` would accept "e" and "+" as exponent syntax and would let
	// a scroll wheel change the value. That is why this is a gated text input.
	it("rejects the exponent characters a number input would allow", async () => {
		const onValueChange = await type("e");

		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("rejects a decimal point when decimal is off", async () => {
		const onValueChange = await type(".");

		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("accepts a decimal point when decimal is on", async () => {
		const onValueChange = await type(".", true);

		expect(onValueChange).toHaveBeenCalledWith(".");
	});

	// A price field must not become "1.2.3". The pattern allows at most one
	// point, and the second is refused like any other bad character.
	it("refuses a second decimal point", async () => {
		const onValueChange = vi.fn();
		renderWithProviders(
			<AppNumericInput
				aria-label="amount"
				value="1.2"
				decimal
				onValueChange={onValueChange}
			/>,
		);

		await userEvent.type(screen.getByLabelText("amount"), ".");

		expect(onValueChange).not.toHaveBeenCalled();
	});

	// Reported raw so the consumer's schema owns the Number conversion and the
	// bounds — the input never rounds, clamps or reformats behind the operator.
	it("reports the raw string, leaving conversion to the schema", async () => {
		const onValueChange = vi.fn();
		renderWithProviders(
			<AppNumericInput
				aria-label="amount"
				value="9"
				decimal
				onValueChange={onValueChange}
			/>,
		);

		await userEvent.type(screen.getByLabelText("amount"), "5");

		expect(onValueChange).toHaveBeenCalledWith("95");
	});

	it("hints the right keyboard for each mode", () => {
		const { rerender } = renderWithProviders(
			<AppNumericInput aria-label="amount" value="" onValueChange={vi.fn()} />,
		);
		expect(screen.getByLabelText("amount")).toHaveAttribute(
			"inputMode",
			"numeric",
		);

		rerender(
			<AppNumericInput
				aria-label="amount"
				value=""
				decimal
				onValueChange={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText("amount")).toHaveAttribute(
			"inputMode",
			"decimal",
		);
	});
});
