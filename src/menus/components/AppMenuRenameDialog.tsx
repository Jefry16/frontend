import {
	AppDialogFooter,
	AppTextInput,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@vointika/ui";
import { useEffect, useState } from "react";
import * as m from "#/paraglide/messages";

export const AppMenuRenameDialog = ({
	open,
	onOpenChange,
	currentTitle,
	pending,
	onRename,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentTitle: string;
	pending: boolean;
	onRename: (title: string) => void;
}) => {
	const [title, setTitle] = useState(currentTitle);
	const trimmed = title.trim();
	const valid = trimmed.length >= 1 && trimmed.length <= 120;

	useEffect(() => {
		if (open) setTitle(currentTitle);
	}, [open, currentTitle]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.rename_menu_title()}</DialogTitle>
					<DialogDescription>{m.rename_menu_hint()}</DialogDescription>
				</DialogHeader>
				<AppTextInput
					autoFocus
					value={title}
					aria-label={m.title()}
					onValueChange={setTitle}
				/>
				<AppDialogFooter
					onConfirm={() => onRename(trimmed)}
					disabled={!valid}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
};
