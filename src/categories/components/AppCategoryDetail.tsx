import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	Card,
	CardContent,
	useAppToast,
} from "@vointika/ui";
import { Languages, Pencil, Tags, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useCategory } from "../hooks/use-category";
import { useCategoryActions } from "../hooks/use-category-actions";

export const AppCategoryDetail = ({
	tourOperatorId,
	categoryId,
}: {
	tourOperatorId: string;
	categoryId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const query = useCategory(tourOperatorId, categoryId);
	const { remove } = useCategoryActions(tourOperatorId, categoryId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/categories"
			params={{ tourOperatorId }}
		>
			{m.back_to_categories()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.category()}
			icon={Tags}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.categories() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={2} />}
		>
			{(category) => {
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/categories/$categoryId/edit",
								params: { tourOperatorId, categoryId },
							}),
					},
					{
						id: "translations",
						label: m.translations(),
						icon: Languages,
						member: true,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/categories/$categoryId/translations",
								params: { tourOperatorId, categoryId },
							}),
					},
					{
						id: "delete",
						label: m.delete_category(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.delete_category_title(),
							description: m.delete_category_body(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.deleted(m.category());
									queryClient.removeQueries({
										queryKey: queryKeys.category(tourOperatorId, categoryId),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/categories",
										params: { tourOperatorId },
									});
								},
							}),
					},
				];
				return (
					<>
						<AppPageHeader
							title={category.name}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.catalog() },
										{
											label: m.categories(),
											to: "/tour-operators/$tourOperatorId/categories",
											params: { tourOperatorId },
										},
										{ label: category.name },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>
						<Card>
							<CardContent>
								<dl className="grid grid-cols-2 gap-4">
									<AppDetailField label={m.handle()}>
										<span className="font-mono text-sm">{category.handle}</span>
									</AppDetailField>
									<AppDetailField label={m.created()}>
										{formatDate(category.createdAt)}
									</AppDetailField>
								</dl>
							</CardContent>
						</Card>
						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="CATEGORY"
							entityId={categoryId}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
