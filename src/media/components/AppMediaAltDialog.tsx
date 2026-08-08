import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Spinner } from "#/components/ui/spinner";
import { Textarea } from "#/components/ui/textarea";
import * as m from "#/paraglide/messages";

const MAX = 255;

// Describes what the image shows. A dialog rather than an edit page: alt is the
// only writable field on a media row, so a page would hold one input.
//
// Submitting empty clears it — the backend treats blank as "no description",
// which is the right answer for a decorative image and wrong for every other
// one, so the copy says so rather than blocking the save.
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

	// Opens programmatically, so onOpenChange never fires with `true` — without
	// this a cancelled edit leaks into the next open.
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
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						{m.cancel()}
					</Button>
					<Button
						type="button"
						disabled={pending || trimmed === (currentAlt ?? "")}
						onClick={() => onSave(trimmed)}
					>
						{pending && <Spinner />}
						{m.save_changes()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
