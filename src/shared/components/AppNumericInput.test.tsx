import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppNumericInput } from "./AppNumericInput";

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
	it("accepts digits", async () => {
		const onValueChange = await type("42");

		expect(onValueChange.mock.calls.flat()).toEqual(["4", "2"]);
	});

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
