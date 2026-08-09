import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppDialogFooter } from "#/shared/components/AppDialogFooter";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Renames the page's canonical handle — a dialog because changing the
// permanent URL is a deliberate act (the backend gives it its own endpoint
// for the same reason). 409 = the handle is taken.
export const AppRenameHandleDialog = ({
	open,
	onOpenChange,
	currentHandle,
	pending,
	errorMessage,
	onRename,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentHandle: string;
	pending: boolean;
	errorMessage: string | null;
	onRename: (handle: string) => void;
}) => {
	const [handle, setHandle] = useState(currentHandle);
	const valid = SLUG_RE.test(handle) && handle.length <= 170;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (next) setHandle(currentHandle);
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.rename_handle()}</DialogTitle>
					<DialogDescription>{m.rename_handle_hint()}</DialogDescription>
				</DialogHeader>
				{errorMessage && (
					<AppAlert title={m.error()} description={errorMessage} />
				)}
				<div className="flex items-center gap-1">
					<span className="text-sm text-muted-foreground">/pages/</span>
					<Input
						autoFocus
						value={handle}
						aria-label={m.handle()}
						onChange={(e) => setHandle(e.target.value)}
						className="font-mono"
					/>
				</div>
				<AppDialogFooter
					onConfirm={() => onRename(handle)}
					confirmLabel={m.rename_handle()}
					disabled={!valid || handle === currentHandle}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
};
