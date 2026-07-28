import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Shapes, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime } from "#/tour-operator";
import { metaobjectStatusBadgeVariant, metaobjectStatusLabel } from "../format";
import { useMetaobject } from "../hooks/use-metaobject";
import { useMetaobjectActions } from "../hooks/use-metaobject-actions";
import { useMetaobjectDefinition } from "../hooks/use-metaobject-definition";
import type { Metaobject } from "../types";

// Entry detail: identity facts + every field's stored value (— when unset) +
// Edit / Publish-Unpublish / Delete actions. The definition's entries table
// links here.
export const AppMetaobjectDetail = ({
	tourOperatorId,
	metaobjectId,
}: {
	tourOperatorId: string;
	metaobjectId: string;
}) => {
	const query = useMetaobject(tourOperatorId, metaobjectId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/metaobjects"
			params={{ tourOperatorId }}
		>
			{m.back_to_metaobjects()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.metaobject()}
			icon={Shapes}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metaobjects() }]}
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
			{(entry) => (
				<MetaobjectView tourOperatorId={tourOperatorId} entry={entry} />
			)}
		</AppResourceView>
	);
};

const MetaobjectView = ({
	tourOperatorId,
	entry,
}: {
	tourOperatorId: string;
	entry: Metaobject;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	// The definition names the breadcrumb node (and its detail is the natural
	// "up" destination for this entry).
	const definition = useMetaobjectDefinition(
		tourOperatorId,
		entry.definitionId,
	);
	const { publish, unpublish, remove } = useMetaobjectActions(
		tourOperatorId,
		entry.id,
	);

	const actions: AppAction[] = [
		{
			id: "edit",
			label: m.edit(),
			icon: Pencil,
			onSelect: () =>
				navigate({
					to: "/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/edit",
					params: { tourOperatorId, metaobjectId: entry.id },
				}),
		},
		entry.published
			? {
					id: "unpublish",
					label: m.unpublish(),
					icon: EyeOff,
					pending: unpublish.isPending,
					onSelect: () => unpublish.mutate(),
				}
			: {
					id: "publish",
					label: m.publish(),
					icon: Eye,
					pending: publish.isPending,
					onSelect: () => publish.mutate(),
				},
		{
			id: "delete",
			label: m.delete_metaobject(),
			icon: Trash2,
			variant: "destructive",
			pending: remove.isPending,
			confirm: {
				title: m.delete_metaobject_title(),
				description: m.delete_metaobject_body(),
			},
			onSelect: () =>
				remove.mutate(undefined, {
					onSuccess: () => {
						toast.deleted(m.metaobject());
						queryClient.removeQueries({
							queryKey: queryKeys.metaobject(tourOperatorId, entry.id),
						});
						navigate({
							to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId",
							params: { tourOperatorId, definitionId: entry.definitionId },
						});
					},
				}),
		},
	];

	return (
		<>
			<AppPageHeader
				title={entry.name}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.metaobjects(),
								to: "/tour-operators/$tourOperatorId/content/metaobjects",
								params: { tourOperatorId },
							},
							...(definition.data
								? [
										{
											label: definition.data.name,
											to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId" as const,
											params: {
												tourOperatorId,
												definitionId: entry.definitionId,
											},
										},
									]
								: []),
							{ label: entry.name },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} />}
			/>

			<Card>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-2">
						<AppBadge variant={metaobjectStatusBadgeVariant(entry.published)}>
							{metaobjectStatusLabel(entry.published)}
						</AppBadge>
					</div>
					<dl className="grid grid-cols-2 gap-4">
						<AppDetailField label={m.handle()}>
							<span className="font-mono text-sm">{entry.handle}</span>
						</AppDetailField>
						<AppDetailField label={m.created()}>
							{formatDate(entry.createdAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.metaobject_fields()}</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{entry.fields.map((field) => (
							<AppDetailField key={field.key} label={field.name}>
								{field.value !== null ? (
									field.type === "json" || field.type === "multi_line_text" ? (
										<pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-2 text-xs whitespace-pre-wrap break-words font-mono">
											{field.value}
										</pre>
									) : (
										field.value
									)
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</AppDetailField>
						))}
					</dl>
				</CardContent>
			</Card>

			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="METAOBJECT"
				entityId={entry.id}
			/>
		</>
	);
};
