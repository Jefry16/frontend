import {
	AppDetailField,
	AppDetailSkeleton,
	AppPageHeader,
	AppResourceView,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
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
						<Card>
							<CardContent>
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
											<span className="font-mono text-xs">
												{entry.requestId}
											</span>
										</AppDetailField>
									)}
								</dl>
							</CardContent>
						</Card>
						{entry.changes && entry.changes.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>{m.changes()}</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{m.field()}</TableHead>
												<TableHead>{m.from()}</TableHead>
												<TableHead>{m.to()}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{entry.changes.map((change, index) => (
												<TableRow
													// biome-ignore lint/suspicious/noArrayIndexKey: static per-entry diff list
													key={index}
												>
													<TableCell className="font-medium">
														{formatAuditField(change.field)}
													</TableCell>
													<TableCell className="text-muted-foreground">
														{formatAuditValue(change.from)}
													</TableCell>
													<TableCell>{formatAuditValue(change.to)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						)}
						{details.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>{m.details()}</CardTitle>
								</CardHeader>
								<CardContent>
									<dl className="grid grid-cols-2 gap-4">
										{details.map(([key, value]) => (
											<AppDetailField key={key} label={formatAuditField(key)}>
												{formatAuditValue(value)}
											</AppDetailField>
										))}
									</dl>
								</CardContent>
							</Card>
						)}
					</>
				);
			}}
		</AppResourceView>
	);
};
