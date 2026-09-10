import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { timestampColumn } from "#/shared/components/table-columns";
import type { ContactMessageListItem } from "./types";

export const contactMessageColumns = (
	tourOperatorId: string,
	formatDate: (iso: string) => string,
): ColumnDef<ContactMessageListItem, unknown>[] => [
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
				{row.original.summary}
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
	timestampColumn<ContactMessageListItem>(
		"createdAt",
		m.inbox_received(),
		formatDate,
	),
];
