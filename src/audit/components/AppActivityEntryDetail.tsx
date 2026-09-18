import {
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageHeader,
	AppResourceView,
	AppStaticTable,
	type AppStaticTableColumn,
} from "@vointika/ui";
import { History } from "lucide-react";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
import {
	entityRoute,
	formatAuditAction,
	formatAuditActor,
	formatAuditField,
	formatAuditValue,
	formatEntityType,
} from "../format";
import { useAuditLogEntry } from "../hooks/use-audit-log-entry";
import type { AuditFieldChange } from "../types";

const CHANGE_COLUMNS: AppStaticTableColumn<AuditFieldChange>[] = [
	{
		id: "field",
		header: m.field(),
		cell: (change) => formatAuditField(change.field),
		emphasis: "strong",
	},
	{
		id: "from",
		header: m.from(),
		cell: (change) => formatAuditValue(change.from),
		emphasis: "muted",
	},
	{ id: "to", header: m.to(), cell: (change) => formatAuditValue(change.to) },
];

export const AppActivityEntryDetail = ({
	tourOperatorId,
	entryId,
}: {
	tourOperatorId: string;
	entryId: string;
}) => {
	const { formatTimestamp } = useOperatorDateTime();
	const query = useAuditLogEntry(tourOperatorId, entryId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/activity"
			params={{ tourOperatorId }}
		>
			{m.back_to_activity()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.activity_entry()}
			icon={History}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.operations() }, { label: m.activity() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(entry) => {
				const when = formatTimestamp(entry.createdAt);
				const route = entityRoute(
					entry.entityType,
					tourOperatorId,
					entry.entityId,
				);
				const entityLabel = formatEntityType(entry.entityType);
				const details = Object.entries(entry.details ?? {});
				return (
					<>
						<AppPageHeader
							title={formatAuditAction(entry.action)}
							description={formatAuditActor(entry)}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.operations() },
										{
											label: m.activity(),
											to: "/tour-operators/$tourOperatorId/activity",
											params: { tourOperatorId },
										},
										{ label: formatAuditAction(entry.action) },
									]}
								/>
							}
						/>
						<AppCard>
							<dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<AppDetailField label={m.actor()}>
									{formatAuditActor(entry)}
								</AppDetailField>
								<AppDetailField label={m.entity()}>
									{route ? (
										<AppResourceLink to={route.to} params={route.params}>
											{entityLabel}
										</AppResourceLink>
									) : (
										entityLabel
									)}
								</AppDetailField>
								<AppDetailField label={m.date()}>{when}</AppDetailField>
								{entry.requestId && (
									<AppDetailField label={m.request_id()}>
										<span className="font-mono text-xs">{entry.requestId}</span>
									</AppDetailField>
								)}
							</dl>
						</AppCard>
						{entry.changes && entry.changes.length > 0 && (
							<AppCard title={m.changes()}>
								<AppStaticTable
									columns={CHANGE_COLUMNS}
									rows={entry.changes}
									rowKey={(_, index) => String(index)}
								/>
							</AppCard>
						)}
						{details.length > 0 && (
							<AppCard title={m.details()}>
								<dl className="grid grid-cols-2 gap-4">
									{details.map(([key, value]) => (
										<AppDetailField key={key} label={formatAuditField(key)}>
											{formatAuditValue(value)}
										</AppDetailField>
									))}
								</dl>
							</AppCard>
						)}
					</>
				);
			}}
		</AppResourceView>
	);
};
