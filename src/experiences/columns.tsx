import type { ColumnDef } from "@tanstack/react-table";
import { AppBadge } from "@vointika/ui";
import { formatMoney } from "#/lib/money";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import { statusBadgeVariant, statusLabel } from "./format";
import type { Experience } from "./types";

export const experienceColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
	currency: string | null,
): ColumnDef<Experience, unknown>[] => {
	return [
		{
			id: "thumbnail",
			header: () => null,
			cell: ({ row }) =>
				row.original.thumbnailUrl ? (
					<img
						src={row.original.thumbnailUrl}
						alt={row.original.name}
						loading="lazy"
						className="h-12 w-16 rounded-md border object-cover"
					/>
				) : (
					<div className="h-12 w-16 rounded-md border bg-muted" />
				),
		},
		{
			id: "name",
			enableSorting: true,
			header: (headerContext) => (
				<AppDataTableHeader label={m.name()} headerContext={headerContext} />
			),
			cell: ({ row }) => (
				<AppResourceLink
					to="/tour-operators/$tourOperatorId/experiences/$experienceId"
					params={{ tourOperatorId, experienceId: row.original.id }}
					className="font-medium"
				>
					{row.original.name}
				</AppResourceLink>
			),
		},
		{
			id: "startingPrice",
			accessorKey: "startingPrice",
			header: () => (
				<span className="block text-right font-semibold">
					{m.starting_price()}
				</span>
			),
			cell: ({ row }) => (
				<span className="block text-right tabular-nums">
					{formatMoney(row.original.startingPrice, currency)}
				</span>
			),
		},
		{
			id: "status",
			header: () => <span className="font-semibold">{m.status()}</span>,
			cell: ({ row }) => (
				<AppBadge variant={statusBadgeVariant(row.original.published)}>
					{statusLabel(row.original.published)}
				</AppBadge>
			),
		},
		timestampColumn<Experience>("createdAt", m.created(), formatDate),
	];
};
