import type { ColumnDef } from "@tanstack/react-table";
import { AppDataTableHeader } from "./AppDataTableHeader";

export const timestampColumn = <T,>(
	id: Extract<keyof T, string>,
	label: string,
	format: (iso: string) => string,
): ColumnDef<T, unknown> => ({
	id,
	accessorKey: id,
	enableSorting: true,
	header: (headerContext) => (
		<AppDataTableHeader label={label} headerContext={headerContext} />
	),
	cell: ({ row }) => (
		<span className="whitespace-nowrap">
			{format(row.original[id] as string)}
		</span>
	),
});
