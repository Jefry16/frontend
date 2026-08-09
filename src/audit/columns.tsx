import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppLink } from "#/shared/components/AppLink";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { EmptyValue } from "#/shared/components/EmptyValue";
import { timestampColumn } from "#/shared/components/table-columns";
import {
	ACTION_OPTIONS,
	ENTITY_TYPE_OPTIONS,
	entityRoute,
	formatAuditAction,
	formatAuditActor,
	formatAuditField,
	formatAuditValue,
	formatEntityType,
} from "./format";
import type { AuditLogEntry } from "./types";

const SHOWN_CHANGES = 2;

// createdAt sorts by descending id, which is the server default. It has no
// date-range filter yet: the backend supports one, the table framework does not.
export const activityColumns = (
	tourOperatorId: string,
	formatDateTime: (iso: string) => string,
): ColumnDef<AuditLogEntry, unknown>[] => [
	timestampColumn<AuditLogEntry>("createdAt", m.date(), formatDateTime),
	{
		// Filters on the FROZEN actor name. An actorType filter earns its place
		// when SYSTEM emitters exist; today every writer is a USER.
		id: "actorName",
		accessorKey: "actorName",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.actor()}
				headerContext={ctx}
				allowFiltering="text"
			/>
		),
		cell: ({ row }) => (
			<span className="font-medium">{formatAuditActor(row.original)}</span>
		),
	},
	{
		id: "action",
		accessorKey: "action",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.action_label()}
				headerContext={ctx}
				allowFiltering="set"
				items={ACTION_OPTIONS}
			/>
		),
		cell: ({ row }) => (
			<AppResourceLink
				to="/tour-operators/$tourOperatorId/activity/$entryId"
				params={{ tourOperatorId, entryId: row.original.id }}
			>
				{formatAuditAction(row.original.action)}
			</AppResourceLink>
		),
	},
	{
		id: "entityType",
		accessorKey: "entityType",
		header: (ctx) => (
			<AppDataTableHeader
				label={m.entity()}
				headerContext={ctx}
				allowFiltering="set"
				items={ENTITY_TYPE_OPTIONS}
			/>
		),
		cell: ({ row }) => {
			const label = formatEntityType(row.original.entityType);
			const route = entityRoute(
				row.original.entityType,
				tourOperatorId,
				row.original.entityId,
			);
			if (!route) return label;
			return (
				<AppLink
					to={route.to}
					params={route.params}
					className="text-info underline-offset-2 hover:underline"
				>
					{label}
				</AppLink>
			);
		},
	},
	{
		id: "changes",
		header: () => <span className="font-semibold">{m.changes()}</span>,
		cell: ({ row }) => {
			const changes = row.original.changes;
			if (!changes || changes.length === 0) {
				return <EmptyValue />;
			}
			return (
				<div className="flex flex-col gap-0.5 text-muted-foreground">
					{changes.slice(0, SHOWN_CHANGES).map((change, index) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: a field can repeat (one capacity diff per tier), so position is the identity
							key={index}
							className="truncate"
						>
							{formatAuditField(change.field)}
							{": "}
							{formatAuditValue(change.from)}
							{" → "}
							{formatAuditValue(change.to)}
						</span>
					))}
					{changes.length > SHOWN_CHANGES && (
						<span>
							{m.more_changes({ count: changes.length - SHOWN_CHANGES })}
						</span>
					)}
				</div>
			);
		},
	},
];
