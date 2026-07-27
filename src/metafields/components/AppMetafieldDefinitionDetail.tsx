import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Database, Pencil, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent } from "#/components/ui/card";
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
import { ownerTypeLabel, typeLabel } from "../format";
import { useMetafieldDefinition } from "../hooks/use-metafield-definition";
import { useMetafieldDefinitionActions } from "../hooks/use-metafield-definition-actions";

// Definition detail: the identity facts (immutable) + name/description, with
// Edit and Delete actions. Delete is destructive-confirmed with the cascade
// warning — it removes every stored value for this field.
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

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/metafields"
			params={{ tourOperatorId }}
		>
			{m.back_to_metafields()}
		</AppBackLink>
	);

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
							actions={<AppPageActions actions={actions} />}
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
										{typeLabel(definition.type)}
									</AppDetailField>
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
