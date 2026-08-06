import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Shapes, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppActivityCard } from "#/audit";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import { metafieldTypeLabel } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppConfirmDialog } from "#/shared/components/AppConfirmDialog";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppNewLink } from "#/shared/components/AppNewLink";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { metaobjectEntryColumns } from "../columns";
import { useMetaobjectDefinition } from "../hooks/use-metaobject-definition";
import { useMetaobjectDefinitionActions } from "../hooks/use-metaobject-definition-actions";
import type { MetaobjectDefinition, MetaobjectField } from "../types";
import { AppMetaobjectFieldDialog } from "./AppMetaobjectFieldDialog";

// Definition detail: the type's facts + its FIELD set (add/rename/remove via
// dialogs — key/type immutable per field, remove cascades stored values) +
// the entries of this type as the standard table + Edit and Delete (cascade-
// confirmed) actions. The list's name column links here.
export const AppMetaobjectDefinitionDetail = ({
	tourOperatorId,
	definitionId,
}: {
	tourOperatorId: string;
	definitionId: string;
}) => {
	const query = useMetaobjectDefinition(tourOperatorId, definitionId);

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
			resource={m.metaobject_definition()}
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
			{(definition) => (
				<DefinitionView
					tourOperatorId={tourOperatorId}
					definition={definition}
				/>
			)}
		</AppResourceView>
	);
};

const DefinitionView = ({
	tourOperatorId,
	definition,
}: {
	tourOperatorId: string;
	definition: MetaobjectDefinition;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const { remove, addField, renameField, removeField } =
		useMetaobjectDefinitionActions(tourOperatorId, definition.id);

	// One dialog instance per mode: add (no field), rename (with one), and a
	// removal confirm. Rename keeps its target through the close animation
	// (a separate open flag) so the dialog doesn't flash into add-mode.
	const [addOpen, setAddOpen] = useState(false);
	const [renameOpen, setRenameOpen] = useState(false);
	const [renaming, setRenaming] = useState<MetaobjectField | null>(null);
	const [removing, setRemoving] = useState<MetaobjectField | null>(null);

	const entryColumns = useMemo(
		() => metaobjectEntryColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();
	const actions: AppAction[] = [
		{
			id: "edit",
			label: m.edit(),
			icon: Pencil,
			onSelect: () =>
				navigate({
					to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/edit",
					params: { tourOperatorId, definitionId: definition.id },
				}),
		},
		{
			id: "delete",
			label: m.delete_metaobject_definition(),
			icon: Trash2,
			variant: "destructive",
			pending: remove.isPending,
			confirm: {
				title: m.delete_metaobject_definition_title(),
				description: m.delete_metaobject_definition_body(),
			},
			onSelect: () =>
				remove.mutate(undefined, {
					onSuccess: () => {
						toast.deleted(m.metaobject_definition());
						queryClient.removeQueries({
							queryKey: queryKeys.metaobjectDefinition(
								tourOperatorId,
								definition.id,
							),
						});
						navigate({
							to: "/tour-operators/$tourOperatorId/content/metaobjects",
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
								label: m.metaobjects(),
								to: "/tour-operators/$tourOperatorId/content/metaobjects",
								params: { tourOperatorId },
							},
							{ label: definition.name },
						]}
					/>
				}
				actions={<AppPageActions actions={canWrite ? actions : []} />}
			/>

			<Card>
				<CardContent>
					<dl className="grid grid-cols-2 gap-4">
						<AppDetailField label={m.metaobject_type()}>
							<span className="font-mono text-sm">{definition.type}</span>
						</AppDetailField>
						<AppDetailField label={m.created()}>
							{formatDate(definition.createdAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{m.metaobject_fields()}</CardTitle>
					<Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
						{m.metaobject_add_field()}
					</Button>
				</CardHeader>
				<CardContent>
					<ul className="flex flex-col divide-y">
						{definition.fields.map((field) => (
							<li
								key={field.key}
								className="flex items-center justify-between gap-3 py-2.5"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{field.name}</p>
									<p className="font-mono text-xs text-muted-foreground">
										{field.key} · {metafieldTypeLabel(field.type)}
									</p>
								</div>
								<div className="flex shrink-0 gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setRenaming(field);
											setRenameOpen(true);
										}}
									>
										{m.rename()}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-destructive"
										disabled={definition.fields.length === 1}
										onClick={() => setRemoving(field)}
									>
										{m.remove()}
									</Button>
								</div>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{m.metaobject_entries()}</CardTitle>
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/entries/new"
						params={{ tourOperatorId, definitionId: definition.id }}
					>
						{m.new_metaobject()}
					</AppNewLink>
				</CardHeader>
				<CardContent>
					<AppDataTable
						columns={entryColumns}
						endpoint={`/tour-operators/${tourOperatorId}/metaobjects`}
						queryKey={[...queryKeys.metaobjects(tourOperatorId), definition.id]}
						baseParams={{ "filter[definitionId][in]": definition.id }}
						emptyState={{
							title: m.no_metaobjects(),
							description: m.no_metaobjects_body(),
						}}
					/>
				</CardContent>
			</Card>

			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="METAOBJECT_DEFINITION"
				entityId={definition.id}
			/>

			<AppMetaobjectFieldDialog
				open={addOpen}
				onOpenChange={(open) => {
					setAddOpen(open);
					if (open) addField.reset();
				}}
				pending={addField.isPending}
				errorMessage={
					addField.error
						? addField.error.response?.status === 409
							? m.metaobject_field_key_taken()
							: apiErrorMessage(addField.error)
						: null
				}
				onSubmit={(field) =>
					addField.mutate(field, { onSuccess: () => setAddOpen(false) })
				}
			/>
			<AppMetaobjectFieldDialog
				open={renameOpen}
				onOpenChange={setRenameOpen}
				field={renaming ?? undefined}
				pending={renameField.isPending}
				errorMessage={null}
				onSubmit={(field) =>
					renameField.mutate(
						{ key: field.key, name: field.name },
						{ onSuccess: () => setRenameOpen(false) },
					)
				}
			/>
			<AppConfirmDialog
				open={removing !== null}
				onOpenChange={(open) => {
					if (!open) setRemoving(null);
				}}
				title={m.metaobject_remove_field_title()}
				description={m.metaobject_remove_field_body()}
				confirmLabel={m.remove()}
				destructive
				pending={removeField.isPending}
				onConfirm={() => {
					if (removing) {
						removeField.mutate(
							{ key: removing.key },
							{ onSettled: () => setRemoving(null) },
						);
					}
				}}
			/>
		</>
	);
};
