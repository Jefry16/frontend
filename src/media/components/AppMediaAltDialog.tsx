import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";
import * as m from "#/paraglide/messages";
import { AppDialogFooter } from "#/shared/components/AppDialogFooter";

const MAX = 255;

// A dialog rather than an edit page: alt is the only writable field on a media
// row. Submitting empty CLEARS it, which is right for a decorative image and
// wrong for every other one — so the copy warns rather than blocking the save.
export const AppMediaAltDialog = ({
	open,
	onOpenChange,
	currentAlt,
	pending,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentAlt: string | null;
	pending: boolean;
	onSave: (alt: string) => void;
}) => {
	const [alt, setAlt] = useState(currentAlt ?? "");
	const trimmed = alt.trim();

	// Opens programmatically, so onOpenChange never fires with `true`, and a
	// cancelled edit would otherwise leak into the next open.
	useEffect(() => {
		if (open) setAlt(currentAlt ?? "");
	}, [open, currentAlt]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.media_alt_title()}</DialogTitle>
					<DialogDescription>{m.media_alt_hint()}</DialogDescription>
				</DialogHeader>
				<Textarea
					autoFocus
					rows={3}
					value={alt}
					maxLength={MAX}
					aria-label={m.media_alt()}
					placeholder={m.media_alt_placeholder()}
					onChange={(e) => setAlt(e.target.value)}
				/>
				<AppDialogFooter
					onConfirm={() => onSave(trimmed)}
					disabled={trimmed === (currentAlt ?? "")}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
};
