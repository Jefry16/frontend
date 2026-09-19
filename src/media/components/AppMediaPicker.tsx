import {
	AppDialogFooter,
	AppError,
	Button,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Spinner,
} from "@vointika/ui";
import { Check, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useMediaLibrary } from "../hooks/use-media-library";
import type { MediaAsset } from "../types";

export const AppMediaPicker = ({
	tourOperatorId,
	open,
	onOpenChange,
	mode,
	initialSelected,
	onConfirm,
}: {
	tourOperatorId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "single" | "multi";
	initialSelected: MediaAsset[];
	onConfirm: (assets: MediaAsset[]) => void;
}) => {
	const library = useMediaLibrary(tourOperatorId, open);
	const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map());

	// biome-ignore lint/correctness/useExhaustiveDependencies: seed once per open, not on every initialSelected identity change
	useEffect(() => {
		if (open) {
			setSelected(new Map(initialSelected.map((a) => [a.id, a])));
		}
	}, [open]);

	const assets = library.data?.pages.flatMap((page) => page.data) ?? [];

	const toggle = (asset: MediaAsset) => {
		setSelected((prev) => {
			if (mode === "single") return new Map([[asset.id, asset]]);
			const next = new Map(prev);
			if (next.has(asset.id)) next.delete(asset.id);
			else next.set(asset.id, asset);
			return next;
		});
	};

	const confirm = () => {
		onConfirm([...selected.values()]);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{m.select_media()}</DialogTitle>
					<DialogDescription>{m.select_media_hint()}</DialogDescription>
				</DialogHeader>

				{library.isError ? (
					<AppError
						description={apiErrorMessage(library.error)}
						onRetry={() => library.refetch()}
					/>
				) : library.isLoading ? (
					<div className="flex justify-center py-16">
						<Spinner />
					</div>
				) : assets.length === 0 ? (
					<div className="flex flex-col items-center gap-2 py-16 text-center">
						<Images className="size-8 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">{m.no_images()}</p>
					</div>
				) : (
					<div className="max-h-128 overflow-y-auto">
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
							{assets.map((asset) => {
								const isSelected = selected.has(asset.id);
								return (
									<button
										key={asset.id}
										type="button"
										onClick={() => toggle(asset)}
										aria-pressed={isSelected}
										className={cn(
											"group relative aspect-square overflow-hidden rounded-md border bg-muted",
											isSelected && "ring-2 ring-primary ring-offset-2",
										)}
									>
										<img
											src={asset.url}
											alt={asset.originalName}
											className="size-full object-cover"
										/>
										{isSelected && (
											<span className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
												<Check className="size-4" />
											</span>
										)}
									</button>
								);
							})}
						</div>
						{library.hasNextPage && (
							<div className="mt-3 flex justify-center">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={library.isFetchingNextPage}
									onClick={() => library.fetchNextPage()}
								>
									{library.isFetchingNextPage && <Spinner className="size-4" />}
									{m.load_more()}
								</Button>
							</div>
						)}
					</div>
				)}

				<AppDialogFooter onConfirm={confirm} confirmLabel={m.select()} />
			</DialogContent>
		</Dialog>
	);
};
