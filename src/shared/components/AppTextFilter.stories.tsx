import type { Meta, StoryObj } from "@storybook/tanstack-react";
import {
	type ColumnFiltersState,
	createColumnHelper,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { AppTextFilter } from "./AppTextFilter";

// Drive the filter with a real (headless) table so column state behaves as in
// the app; the current filter value is echoed below.
function Demo() {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const helper = createColumnHelper<{ name: string }>();
	const table = useReactTable({
		data: [],
		columns: [helper.accessor("name", {})],
		state: { columnFilters },
		onColumnFiltersChange: setColumnFilters,
		manualFiltering: true,
		getCoreRowModel: getCoreRowModel(),
	});
	const column = table.getColumn("name");
	if (!column) return null;
	const headerContext = {
		column,
		table,
	} as Parameters<typeof AppTextFilter>[0]["headerContext"];

	return (
		<div className="flex w-56 flex-col gap-3">
			<AppTextFilter headerContext={headerContext} />
			<pre className="text-xs text-muted-foreground">
				{JSON.stringify(columnFilters, null, 2)}
			</pre>
		</div>
	);
}

const meta = {
	title: "Shared/AppTextFilter",
	component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
