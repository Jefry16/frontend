import { useState } from "react";
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
import { AppAlert } from "#/shared/components/AppAlert";

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
						disabled={pending || !valid || handle === currentHandle}
						onClick={() => onRename(handle)}
					>
						{pending && <Spinner className="size-4" />}
						{m.rename_handle()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
