import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import * as m from "#/paraglide/messages";
import { AppDialogFooter } from "#/shared/components/AppDialogFooter";

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
				<Input
					autoFocus
					value={title}
					aria-label={m.title()}
					onChange={(e) => setTitle(e.target.value)}
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
