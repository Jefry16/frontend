import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	Eye,
	EyeOff,
	FileText,
	Languages,
	Link2,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useAppToast } from "#/hooks/use-app-toast";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import { AppMetafieldsCard } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppDetailSkeleton } from "#/shared/components/AppDetailSkeleton";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppSourceBlock } from "#/shared/components/AppSourceBlock";
import { EmptyValue } from "#/shared/components/EmptyValue";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { pageStatusBadgeVariant, pageStatusLabel } from "../format";
import { usePage } from "../hooks/use-page";
import { usePageActions } from "../hooks/use-page-actions";
import { AppRenameHandleDialog } from "./AppRenameHandleDialog";

// Page detail: facts (handle/status/SEO/template/created) + the raw-HTML body
// SOURCE (shown as written, never rendered — the admin authored it, the
// storefront renders it) + the standard action set and the Activity timeline.
export const AppPageDetail = ({
	tourOperatorId,
	pageId,
}: {
	tourOperatorId: string;
	pageId: string;
}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const { formatDate } = useOperatorDateTime();
	const query = usePage(tourOperatorId, pageId);
	const { publish, unpublish, rename, remove } = usePageActions(
		tourOperatorId,
		pageId,
	);
	const [renameOpen, setRenameOpen] = useState(false);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/pages"
			params={{ tourOperatorId }}
		>
			{m.back_to_pages()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.page()}
			icon={FileText}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.pages() }]} />
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={4} />}
		>
			{(page) => {
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/pages/$pageId/edit",
								params: { tourOperatorId, pageId },
							}),
					},
					{
						// ListPageTranslationsUseCase is ensureMember — STAFF may read them.
						id: "translations",
						label: m.translations(),
						icon: Languages,
						member: true,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/pages/$pageId/translations",
								params: { tourOperatorId, pageId },
							}),
					},
					{
						id: "rename",
						label: m.rename_handle(),
						icon: Link2,
						onSelect: () => setRenameOpen(true),
					},
					page.status === "PUBLISHED"
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
						label: m.delete_page(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.delete_page_title(),
							description: m.delete_page_body(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.deleted(m.page());
									queryClient.removeQueries({
										queryKey: queryKeys.pageDetail(tourOperatorId, pageId),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/content/pages",
										params: { tourOperatorId },
									});
								},
							}),
					},
				];

				return (
					<>
						<AppPageHeader
							title={page.title}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.content() },
										{
											label: m.pages(),
											to: "/tour-operators/$tourOperatorId/content/pages",
											params: { tourOperatorId },
										},
										{ label: page.title },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>

						<Card>
							<CardContent className="flex flex-col gap-4">
								<div className="flex flex-wrap gap-2">
									<AppBadge variant={pageStatusBadgeVariant(page.status)}>
										{pageStatusLabel(page.status)}
									</AppBadge>
								</div>
								<dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
									<AppDetailField label={m.handle()}>
										<span className="font-mono text-sm">
											/pages/{page.handle}
										</span>
									</AppDetailField>
									<AppDetailField label={m.seo_title()}>
										{page.seoTitle ?? <EmptyValue />}
									</AppDetailField>
									<AppDetailField label={m.seo_description()}>
										{page.seoDescription ?? <EmptyValue />}
									</AppDetailField>
									<AppDetailField label={m.created()}>
										{formatDate(page.createdAt)}
									</AppDetailField>
								</dl>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.page_body()}</CardTitle>
							</CardHeader>
							<CardContent>
								<AppSourceBlock label={m.page_body()}>
									{page.body}
								</AppSourceBlock>
							</CardContent>
						</Card>

						<AppMetafieldsCard
							tourOperatorId={tourOperatorId}
							ownerType="page"
							ownerId={pageId}
						/>

						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="PAGE"
							entityId={pageId}
						/>

						<AppRenameHandleDialog
							open={renameOpen}
							onOpenChange={(open) => {
								setRenameOpen(open);
								// A stale 409 from a prior attempt must not greet the reopen.
								if (open) rename.reset();
							}}
							currentHandle={page.handle}
							pending={rename.isPending}
							errorMessage={
								rename.error
									? rename.error.response?.status === 409
										? m.page_handle_taken()
										: apiErrorMessage(rename.error)
									: null
							}
							onRename={(handle) =>
								rename.mutate(handle, {
									onSuccess: () => setRenameOpen(false),
								})
							}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
