import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FileText, FileX, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { formatBytes, isImage, mimeLabel } from "../format";
import { useMedia } from "../hooks/use-media";
import { useMediaActions } from "../hooks/use-media-actions";
import type { MediaAsset } from "../types";

// Read-only media detail (preview + facts) plus a destructive Delete, via the
// shared action pattern. Owns its fetch (skeleton / 404 empty state). The
// library's name column links here.
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
	const { remove } = useMediaActions(tourOperatorId, mediaId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/media"
			params={{ tourOperatorId }}
		>
			{m.back_to_media()}
		</AppBackLink>
	);

	// Delete is independent of the loaded record, so it's built once here.
	const { canWrite } = usePermissions();
	const actions: AppAction[] = [
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
			icon={FileX}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.media() }]} />
			}
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-6">
						<Skeleton className="h-48 w-full" />
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{["a", "b", "c", "d"].map((k) => (
								<div key={k} className="flex flex-col gap-2">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-5 w-32" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			}
		>
			{(media) => (
				<MediaFacts
					media={media}
					tourOperatorId={tourOperatorId}
					actions={actions}
					canWrite={canWrite}
				/>
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
								alt={media.originalName}
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
						<AppDetailField label={m.uploaded_by()}>
							{media.uploadedBy.name ?? "—"}
						</AppDetailField>
						<AppDetailField label={m.added()}>
							{formatDateTime(media.createdAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>
			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="MEDIA"
				entityId={media.id}
			/>
		</>
	);
};
