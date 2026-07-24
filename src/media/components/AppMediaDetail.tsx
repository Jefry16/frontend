import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, FileX, Trash2 } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppEmptyState } from "#/shared/components/AppEmptyState";
import { AppLink } from "#/shared/components/AppLink";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { useCurrentTourOperator } from "#/tour-operator";
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
	const timeZone = useCurrentTourOperator()?.timezone;
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const { data: media, isPending, isError } = useMedia(tourOperatorId, mediaId);
	const { remove } = useMediaActions(tourOperatorId, mediaId);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/content/media"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_media()}
		</AppLink>
	);
	// Content / Media, until the specific file resolves (then the filename is added).
	const sectionBreadcrumb = (
		<AppBreadcrumb items={[{ label: m.content() }, { label: m.media() }]} />
	);

	if (isPending) {
		return (
			<>
				<AppPageHeader title={m.media()} breadcrumb={sectionBreadcrumb} />
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
			</>
		);
	}

	if (isError || !media) {
		return (
			<>
				<AppPageHeader title={m.media()} breadcrumb={sectionBreadcrumb} />
				<AppEmptyState
					icon={FileX}
					title={m.media_not_found()}
					action={backLink}
				/>
			</>
		);
	}

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
		<MediaFacts
			media={media}
			tourOperatorId={tourOperatorId}
			timeZone={timeZone}
			actions={actions}
		/>
	);
};

const MediaFacts = ({
	media,
	tourOperatorId,
	timeZone,
	actions,
}: {
	media: MediaAsset;
	tourOperatorId: string;
	timeZone?: string;
	actions: AppAction[];
}) => {
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone,
	});

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
				actions={<AppPageActions actions={actions} />}
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
							{dateFormat.format(new Date(media.createdAt))}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>
		</>
	);
};
