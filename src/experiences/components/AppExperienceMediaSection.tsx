import { useQueryClient } from "@tanstack/react-query";
import {
	AppSkeleton,
	cn,
	FieldDescription,
	FieldLegend,
	FieldSet,
} from "@vointika/ui";
import { ImageOff, Plus, Star, X } from "lucide-react";
import { useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import { AppMediaPicker, type MediaAsset, useMediaByIds } from "#/media";
import * as m from "#/paraglide/messages";

export const AppExperienceMediaSection = ({
	tourOperatorId,
	thumbnailMediaId,
	mediaIds,
	onThumbnailChange,
	onGalleryChange,
}: {
	tourOperatorId: string;
	thumbnailMediaId: string | null;
	mediaIds: string[];
	onThumbnailChange: (id: string | null) => void;
	onGalleryChange: (ids: string[]) => void;
}) => {
	const queryClient = useQueryClient();
	const [pickerOpen, setPickerOpen] = useState(false);

	const { byId, isLoading } = useMediaByIds(tourOperatorId, mediaIds);

	const seed = (assets: MediaAsset[]) => {
		for (const asset of assets) {
			queryClient.setQueryData(
				queryKeys.mediaAsset(tourOperatorId, asset.id),
				asset,
			);
		}
	};

	const applySet = (ids: string[]) => {
		onGalleryChange(ids);
		if (!thumbnailMediaId || !ids.includes(thumbnailMediaId)) {
			onThumbnailChange(ids[0] ?? null);
		}
	};

	const removeItem = (id: string) => {
		const ids = mediaIds.filter((x) => x !== id);
		onGalleryChange(ids);
		if (thumbnailMediaId === id) onThumbnailChange(ids[0] ?? null);
	};

	const galleryAssets = mediaIds
		.map((id) => byId.get(id))
		.filter((a): a is MediaAsset => Boolean(a));

	return (
		<FieldSet>
			<FieldLegend variant="label">{m.media()}</FieldLegend>
			<FieldDescription>{m.experience_media_hint()}</FieldDescription>

			<div className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-4">
				{mediaIds.map((id) => {
					const asset = byId.get(id);
					const isCover = id === thumbnailMediaId;
					return (
						<div
							key={id}
							className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
						>
							{asset ? (
								<img
									src={asset.url}
									alt={asset.originalName}
									className="size-full object-cover"
								/>
							) : isLoading ? (
								<AppSkeleton variant="image" />
							) : (
								<div className="grid size-full place-items-center text-muted-foreground">
									<ImageOff className="size-8" />
								</div>
							)}

							{asset && (
								<button
									type="button"
									aria-label={isCover ? m.cover() : m.set_as_cover()}
									title={isCover ? m.cover() : m.set_as_cover()}
									onClick={() => onThumbnailChange(id)}
									className={cn(
										"absolute left-1 top-1 flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium transition-opacity",
										isCover
											? "text-primary opacity-100"
											: "text-muted-foreground opacity-0 group-hover:opacity-100",
									)}
								>
									<Star className={cn("size-4", isCover && "fill-current")} />
									{isCover && <span>{m.cover()}</span>}
								</button>
							)}

							<button
								type="button"
								aria-label={m.remove()}
								onClick={() => removeItem(id)}
								className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-background/90 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
							>
								<X className="size-4" />
							</button>
						</div>
					);
				})}

				<button
					type="button"
					onClick={() => setPickerOpen(true)}
					className={cn(
						"grid aspect-square place-items-center rounded-md border border-dashed text-muted-foreground",
						"hover:border-primary hover:text-primary",
					)}
				>
					<Plus className="size-8" />
				</button>
			</div>

			<AppMediaPicker
				tourOperatorId={tourOperatorId}
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				mode="multi"
				initialSelected={galleryAssets}
				onConfirm={(assets) => {
					seed(assets);
					applySet(assets.map((a) => a.id));
				}}
			/>
		</FieldSet>
	);
};
