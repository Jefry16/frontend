import type { ColumnDef } from "@tanstack/react-table";
import * as m from "#/paraglide/messages";
import { AppDataTableHeader } from "#/shared/components/AppDataTableHeader";
import { AppLink } from "#/shared/components/AppLink";
import { AppResourceLink } from "#/shared/components/AppResourceLink";
import { EmptyValue } from "#/shared/components/EmptyValue";
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

// The Activity table: when (sortable — descending id is the server default,
// createdAt matches it), who (actorType set filter + actorName text filter),
// what (action set filter, linking to the entry detail), on which entity (set
// filter + a link to the entity's page), and a short field-diff preview.
// createdAt has no date-range filter yet — the table framework's date variant
// lands when a list needs it badly enough (backend already supports it).
export const activityColumns = (
	tourOperatorId: string,
	formatDateTime: (iso: string) => string,
): ColumnDef<AuditLogEntry, unknown>[] => [
	{
		id: "createdAt",
		accessorKey: "createdAt",
		enableSorting: true,
		header: (ctx) => (
			<AppDataTableHeader label={m.date()} headerContext={ctx} />
		),
		cell: ({ row }) => (
			<span className="whitespace-nowrap">
				{formatDateTime(row.original.createdAt)}
			</span>
		),
	},
	{
		// Filters on the FROZEN actor name (the server-side text filter this
		// column exists for); an actorType set filter earns its place when
		// SYSTEM emitters exist — today every writer is a USER.
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
							// A field can repeat (one capacity diff per tier) — the
							// position identifies the row in this static list.
							// biome-ignore lint/suspicious/noArrayIndexKey: static per-entry diff list
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
