import type { HeaderContext } from "@tanstack/react-table";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppTextFilter } from "./AppTextFilter";

interface Row {
	name: string;
}

const stubColumn = () => {
	let value: unknown;
	const setFilterValue = vi.fn((next: unknown) => {
		value = next;
	});
	const context = () =>
		({
			column: { getFilterValue: () => value, setFilterValue },
		}) as unknown as HeaderContext<Row, unknown>;
	return { context, setFilterValue };
};

const settled = { timeout: 2000 };

describe("AppTextFilter", () => {
	it("writes the filter once the typing settles, not per keystroke", async () => {
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn();
		renderWithProviders(<AppTextFilter headerContext={context()} />);

		await user.type(screen.getByRole("textbox"), "sunset");

		await waitFor(
			() =>
				expect(setFilterValue).toHaveBeenCalledWith({
					operator: "contains",
					value: "sunset",
				}),
			settled,
		);
		expect(setFilterValue).toHaveBeenCalledTimes(1);
	});

	it("does not rewrite an unchanged value when the column re-renders", async () => {
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn();
		const { rerender } = renderWithProviders(
			<AppTextFilter headerContext={context()} />,
		);

		await user.type(screen.getByRole("textbox"), "sunset");
		await waitFor(
			() => expect(setFilterValue).toHaveBeenCalledTimes(1),
			settled,
		);

		rerender(<AppTextFilter headerContext={context()} />);
		rerender(<AppTextFilter headerContext={context()} />);

		expect(setFilterValue).toHaveBeenCalledTimes(1);
	});

	it("clears the filter to undefined when the box is emptied", async () => {
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn();
		renderWithProviders(<AppTextFilter headerContext={context()} />);
		const box = screen.getByRole("textbox");

		await user.type(box, "sunset");
		await waitFor(
			() => expect(setFilterValue).toHaveBeenCalledTimes(1),
			settled,
		);

		await user.clear(box);

		await waitFor(
			() => expect(setFilterValue).toHaveBeenLastCalledWith(undefined),
			settled,
		);
	});

	it("keeps the text when only the operator changes", async () => {
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn();
		renderWithProviders(<AppTextFilter headerContext={context()} />);

		await user.type(screen.getByRole("textbox"), "sunset");
		await waitFor(
			() => expect(setFilterValue).toHaveBeenCalledTimes(1),
			settled,
		);

		await user.click(screen.getByRole("combobox"));
		await user.click(await screen.findByRole("option", { name: "Equals" }));

		await waitFor(
			() =>
				expect(setFilterValue).toHaveBeenLastCalledWith({
					operator: "eq",
					value: "sunset",
				}),
			settled,
		);
	});
});
