import type { HeaderContext } from "@tanstack/react-table";
import { vi } from "vitest";

export const stubColumn = <TData>() => {
	let value: unknown;
	const setFilterValue = vi.fn((next: unknown) => {
		value = next;
	});
	const context = () =>
		({
			column: { getFilterValue: () => value, setFilterValue },
		}) as unknown as HeaderContext<TData, unknown>;
	return { context, setFilterValue };
};
