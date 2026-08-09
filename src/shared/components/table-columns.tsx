import type { ColumnDef } from "@tanstack/react-table";
import { AppDataTableHeader } from "./AppDataTableHeader";

/**
 * A sortable timestamp column — created, updated, joined, sent, received.
 *
 * Thirteen lists declared one of these and no two agreed: nine rendered the
 * date bare, three wrapped it in `text-muted-foreground`, one in
 * `whitespace-nowrap`, and two omitted the `accessorKey` the rest carried. The
 * variation tracked nothing — a joined date is not less important than a
 * created one — so this settles on the majority's plain text, and keeps the
 * nowrap for every list rather than the one that happened to need it.
 *
 * `format` comes from `useOperatorDateTime`, so the instant renders in the
 * OPERATOR's timezone.
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
