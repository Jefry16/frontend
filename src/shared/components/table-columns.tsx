import type { ColumnDef } from "@tanstack/react-table";
import { AppDataTableHeader } from "./AppDataTableHeader";

/**
 * A sortable timestamp column. `format` comes from `useOperatorDateTime`, so
 * the instant renders in the OPERATOR's timezone rather than the viewer's.
 */
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
