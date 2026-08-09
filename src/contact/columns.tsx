import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import type { ContactMessageListItem } from "./types";

// The inbox columns: unread badge, subject (links to the message; bold while
// unread), sender (name + email), received. name/email/summary are
// filter-only — the backend sorts by id/createdAt (name is nullable, and
// nullable columns can't keyset-sort).
export const contactMessageColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<ContactMessageListItem, unknown>[] => [
	{
		id: "read",
		accessorKey: "read",
		header: () => null,
		cell: ({ row }) =>
			row.original.read ? null : (
				<AppBadge variant="default">{m.inbox_new()}</AppBadge>
			),
	},
	{
		id: "summary",
		accessorKey: "summary",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.inbox_subject()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/inbox/$messageId"
				params={{ tourOperatorId, messageId: row.original.id }}
			>
				<span className={row.original.read ? "" : "font-semibold"}>
					{row.original.summary}
				</span>
			</AppResourceLink>
		),
	},
	{
		id: "email",
		accessorKey: "email",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.inbox_from()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<div className="min-w-0">
				{row.original.name && (
					<p className="truncate text-sm">{row.original.name}</p>
				)}
				<p className="truncate text-xs text-muted-foreground">
					{row.original.email}
				</p>
			</div>
		),
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader label={m.inbox_received()} headerContext={ctx} />
		),
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
];
