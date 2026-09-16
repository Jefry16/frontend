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
	EmptyValue,
	useAppToast,
} from "@vointika/ui";
import { FileText, Images, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { formatBytes, isImage, mimeLabel } from "../format";
import { useMedia } from "../hooks/use-media";
import { useMediaActions } from "../hooks/use-media-actions";
import type { MediaAsset } from "../types";
import { AppMediaAltDialog } from "./AppMediaAltDialog";

export const AppMediaDetail = ({
	tourOperatorId,
	mediaId,
}: {
	tourOperatorId: string;
	mediaId: string;
}) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const query = useMedia(tourOperatorId, mediaId);
	const { describe, remove } = useMediaActions(tourOperatorId, mediaId);
	const [altOpen, setAltOpen] = useState(false);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/media"
			params={{ tourOperatorId }}
		>
			{m.back_to_media()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();
	const actions: AppAction[] = [
		{
			id: "alt",
			label: m.media_alt_edit(),
			icon: Pencil,
			onSelect: () => setAltOpen(true),
		},
		{
			id: "delete",
			label: m.remove_media(),
			icon: Trash2,
			variant: "destructive",
			pending: remove.isPending,
			confirm: {
				title: m.remove_media_title(),
				description: m.remove_media_body(),
			},
			onSelect: () =>
				remove.mutate(undefined, {
					onSuccess: () => {
						toast.success(m.media_removed());
						queryClient.removeQueries({
							queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId),
						});
						navigate({
							to: "/tour-operators/$tourOperatorId/content/media",
							params: { tourOperatorId },
						});
					},
				}),
		},
	];

	return (
		<AppResourceView
			query={query}
			resource={m.media()}
			icon={Images}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.media() }]} />
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={6} variant="labelled" />}
		>
			{(media) => (
				<>
					<MediaFacts
						media={media}
						tourOperatorId={tourOperatorId}
						actions={actions}
						canWrite={canWrite}
					/>
					<AppMediaAltDialog
						open={altOpen}
						onOpenChange={setAltOpen}
						currentAlt={media.alt}
						pending={describe.isPending}
						onSave={(alt) =>
							describe.mutate(alt, {
								onSuccess: () => {
									toast.success(m.media_alt_saved());
									setAltOpen(false);
								},
							})
						}
					/>
				</>
			)}
		</AppResourceView>
	);
};

const MediaFacts = ({
	media,
	tourOperatorId,
	actions,
	canWrite,
}: {
	media: MediaAsset;
	tourOperatorId: string;
	actions: AppAction[];
	canWrite: boolean;
}) => {
	const { formatDateTime } = useOperatorDateTime();

	return (
		<>
			<AppPageHeader
				title={media.originalName}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.media(),
								to: "/tour-operators/$tourOperatorId/content/media",
								params: { tourOperatorId },
							},
							{ label: media.originalName },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>
			<Card>
				<CardContent className="flex flex-col gap-6">
					<div className="grid min-h-40 place-items-center rounded-md border bg-muted/30 p-4">
						{isImage(media.contentType) ? (
							<img
								src={media.url}
								alt={media.alt ?? media.originalName}
								className="max-h-64 rounded object-contain"
							/>
						) : (
							<FileText className="size-12 text-muted-foreground" />
						)}
					</div>
					<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<AppDetailField label={m.file_type()}>
							{mimeLabel(media.contentType)}
						</AppDetailField>
						<AppDetailField label={m.size()}>
							{formatBytes(media.sizeBytes)}
						</AppDetailField>
						<AppDetailField label={m.media_alt()} className="sm:col-span-2">
							{media.alt ?? <EmptyValue />}
						</AppDetailField>
						<AppDetailField label={m.media_dimensions()}>
							{media.width && media.height ? (
								`${media.width} × ${media.height}`
							) : (
								<EmptyValue />
							)}
						</AppDetailField>
						<AppDetailField label={m.uploaded_by()}>
							{media.uploadedBy.name ?? <EmptyValue />}
						</AppDetailField>
						<AppDetailField label={m.added()}>
							{formatDateTime(media.createdAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>
		</>
	);
};
