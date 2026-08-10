import type { HeaderContext } from "@tanstack/react-table";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppTextFilter } from "./AppTextFilter";

interface Row {
	name: string;
}

// A column that REMEMBERS what was set, the way a real one does. A stub whose
// getFilterValue always returned undefined would make the equality guard below
// untestable — it can only skip a write it can see is redundant.
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

// The debounce is 400ms; give waitFor room past it.
const settled = { timeout: 2000 };

describe("AppTextFilter", () => {
	it("writes the filter once the typing settles, not per keystroke", async () => {
		const user = userEvent.setup();
		const { context, setFilterValue } = stubColumn();
		renderWithProviders(<AppTextFilter headerContext={context()} />);

		await user.type(screen.getByRole("textbox"), "sunset");

		// Six keystrokes, one write.
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

	// THE guard. The effect re-runs whenever the column identity changes, which
	// it does on every table render. Without the prev/next comparison each of
	// those writes the same value back, and each write re-renders the table —
	// which is a loop, not a redundant call.
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

		// A fresh context object each time, as a re-rendering table would give.
		rerender(<AppTextFilter headerContext={context()} />);
		rerender(<AppTextFilter headerContext={context()} />);

		expect(setFilterValue).toHaveBeenCalledTimes(1);
	});

	// Clearing the box must remove the filter, not send `value: ""` — which the
	// backend would read as "matches the empty string".
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
