import {
	AppConfirmDialog,
	AppImageDropzone,
	AppLabelledControl,
	Button,
} from "@vointika/ui";
import { useState } from "react";
import { useMedia } from "#/media";
import * as m from "#/paraglide/messages";
import type { BrandImageSlot } from "../types";

const MAX_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = "image/jpeg,image/png,image/webp";

export const AppBrandImageSlot = ({
	tourOperatorId,
	slot,
	label,
	hint,
	mediaId,
	canWrite,
	pending,
	disabled,
	onFile,
	onClear,
}: {
	tourOperatorId: string;
	slot: BrandImageSlot;
	label: string;
	hint: string;
	mediaId: string | null;
	canWrite: boolean;
	pending: boolean;
	disabled: boolean;
	onFile: (slot: BrandImageSlot, file: File) => void;
	onClear: (slot: BrandImageSlot) => void;
}) => {
	const image = useMedia(tourOperatorId, mediaId);
	const [error, setError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const url = image.data?.url ?? null;

	if (!canWrite) {
		return (
			<AppLabelledControl label={label}>
				{url ? (
					<img
						src={url}
						alt={label}
						className="size-24 rounded-md border object-cover"
					/>
				) : (
					<p className="text-sm text-muted-foreground">{m.not_set()}</p>
				)}
			</AppLabelledControl>
		);
	}

	return (
		<AppLabelledControl label={label}>
			<div className="flex items-start gap-3">
				<AppImageDropzone
					className="size-24 min-h-0 shrink-0"
					previewUrl={url}
					accept={IMAGE_TYPES}
					maxBytes={MAX_BYTES}
					pending={pending}
					disabled={disabled}
					errorMessages={{
						wrongType: m.logo_wrong_type(),
						tooLarge: m.logo_too_large(),
					}}
					onFile={(file) => {
						setError(null);
						onFile(slot, file);
					}}
					onError={setError}
				/>
				<div className="flex min-w-0 flex-col items-start gap-2">
					<p className="text-xs text-muted-foreground">{hint}</p>
					{mediaId && (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:text-destructive"
							disabled={disabled}
							onClick={() => setConfirmOpen(true)}
						>
							{m.remove()}
						</Button>
					)}
				</div>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}

			<AppConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title={m.brand_image_remove_title({ label })}
				description={m.brand_image_remove_body()}
				confirmLabel={m.remove()}
				destructive
				pending={pending}
				onConfirm={() => {
					onClear(slot);
					setConfirmOpen(false);
				}}
			/>
		</AppLabelledControl>
	);
};
