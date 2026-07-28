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
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

// Renames the menu's title — the internal label. The handle (what the theme
// references) never changes, which is why this is a dialog and not an edit
// page.
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

	// The dialog opens programmatically (no trigger), so onOpenChange never
	// fires with `true` — without this, a cancelled edit leaks into the next
	// open.
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
						disabled={!valid || pending}
						onClick={() => onRename(trimmed)}
					>
						{pending && <Spinner />}
						{m.save_changes()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
