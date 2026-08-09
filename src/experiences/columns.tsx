import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import { formatDuration, statusBadgeVariant, statusLabel } from "./format";
import type { Experience } from "./types";

// The experience-list columns. Thumbnail leads, then name (sortable), publish
// status (badge), duration, created. What the list schema supports drives the
// affordances: name + createdAt are sortable (API default = newest first);
// status/duration/thumbnail are display-only for now (the `published` boolean
// filters by eq, which the set-filter component doesn't speak yet). A factory so
// the Created cell closes over the operator tz.
export const experienceColumns = (
	tourOperatorId: string,
	// From useOperatorDateTime — instants render in the OPERATOR's timezone.
	formatDate: (iso: string) => string,
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
			id: "status",
			header: () => <span className="font-semibold">{m.status()}</span>,
			cell: ({ row }) => (
				<AppBadge variant={statusBadgeVariant(row.original.published)}>
					{statusLabel(row.original.published)}
				</AppBadge>
			),
		},
		{
			id: "duration",
			header: () => <span className="font-semibold">{m.duration()}</span>,
			cell: ({ row }) => (
				<span className="text-muted-foreground tabular-nums">
					{formatDuration(row.original.durationMinutes)}
				</span>
			),
		},
		timestampColumn<Experience>("createdAt", m.created(), formatDate),
	];
};
