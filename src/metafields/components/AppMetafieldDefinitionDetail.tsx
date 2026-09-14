import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppBadge,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	Card,
	CardContent,
	useAllPages,
} from "@vointika/ui";
import { Database, Pencil, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
import { metafieldTypeLabel, ownerTypeLabel } from "../format";
import { useMetafieldDefinition } from "../hooks/use-metafield-definition";
import { useMetafieldDefinitionActions } from "../hooks/use-metafield-definition-actions";

export const AppMetafieldDefinitionDetail = ({
	tourOperatorId,
	definitionId,
}: {
	tourOperatorId: string;
	definitionId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const query = useMetafieldDefinition(tourOperatorId, definitionId);
	const { remove } = useMetafieldDefinitionActions(
		tourOperatorId,
		definitionId,
	);
	const metaobjectTypes = useAllPages<{ id: string; name: string }>(
		queryKeys.metaobjectDefinitions(tourOperatorId),
		`/tour-operators/${tourOperatorId}/metaobject-definitions`,
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/metafields"
			params={{ tourOperatorId }}
		>
			{m.back_to_metafields()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.metafield_definition()}
			icon={Database}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metafields() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(definition) => {
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/metafields/$definitionId/edit",
								params: { tourOperatorId, definitionId },
							}),
					},
					{
						id: "delete",
						label: m.delete_metafield_definition(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.delete_metafield_definition_title(),
							description: m.delete_metafield_definition_body(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.deleted(m.metafield_definition());
									queryClient.removeQueries({
										queryKey: queryKeys.metafieldDefinition(
											tourOperatorId,
											definitionId,
										),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/content/metafields",
										params: { tourOperatorId },
									});
								},
							}),
					},
				];
				return (
					<>
						<AppPageHeader
							title={definition.name}
							description={definition.description ?? undefined}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.content() },
										{
											label: m.metafields(),
											to: "/tour-operators/$tourOperatorId/content/metafields",
											params: { tourOperatorId },
										},
										{ label: definition.name },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>
						<Card>
							<CardContent>
								<dl className="grid grid-cols-2 gap-4">
									<AppDetailField label={m.metafield_identifier()}>
										<span className="font-mono text-sm">
											{definition.namespace}.{definition.key}
										</span>
									</AppDetailField>
									<AppDetailField label={m.metafield_applies_to()}>
										<AppBadge variant="secondary">
											{ownerTypeLabel(definition.ownerType)}
										</AppBadge>
									</AppDetailField>
									<AppDetailField label={m.metafield_type()}>
										{metafieldTypeLabel(definition.type)}
									</AppDetailField>
									{definition.metaobjectDefinitionId && (
										<AppDetailField label={m.metafield_references()}>
											<AppResourceLink
												to="/tour-operators/$tourOperatorId/content/metaobjects/$definitionId"
												params={{
													tourOperatorId,
													definitionId: definition.metaobjectDefinitionId,
												}}
											>
												{metaobjectTypes.data?.find(
													(t) => t.id === definition.metaobjectDefinitionId,
												)?.name ?? m.metaobject_definition()}
											</AppResourceLink>
										</AppDetailField>
									)}
									<AppDetailField label={m.created()}>
										{formatDate(definition.createdAt)}
									</AppDetailField>
								</dl>
							</CardContent>
						</Card>
						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="METAFIELD_DEFINITION"
							entityId={definitionId}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
