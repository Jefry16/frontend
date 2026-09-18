import {
	AppDialogFooter,
	AppTextarea,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@vointika/ui";
import { useEffect, useState } from "react";
import * as m from "#/paraglide/messages";

const MAX = 255;

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
				<AppTextarea
					autoFocus
					value={alt}
					maxLength={MAX}
					aria-label={m.media_alt()}
					placeholder={m.media_alt_placeholder()}
					onValueChange={setAlt}
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
