import { ArrowLeft, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useCurrentTourOperator } from "#/tour-operator";
import {
	entityRoute,
	formatAuditAction,
	formatAuditActor,
	formatAuditField,
	formatAuditValue,
	formatEntityType,
} from "../format";
import { useAuditLogEntry } from "../hooks/use-audit-log-entry";

// One audit entry in full: the facts (who/what/entity/when/request id), the
// complete field-diff table, and the action's details payload. Read-only — an
// audit entry has no actions, by design.
export const AppActivityEntryDetail = ({
	tourOperatorId,
	entryId,
}: {
	tourOperatorId: string;
	entryId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const query = useAuditLogEntry(tourOperatorId, entryId);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/activity"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_activity()}
		</AppLink>
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
			loading={
				<Card>
					<CardContent className="grid grid-cols-2 gap-4">
						{["a", "b", "c", "d"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(entry) => {
				const when = new Intl.DateTimeFormat(undefined, {
					dateStyle: "medium",
					timeStyle: "medium",
					timeZone,
				}).format(new Date(entry.createdAt));
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
											<AppLink
												to={route.to}
												params={route.params}
												className="text-info hover:underline"
											>
												{entityLabel}
											</AppLink>
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
