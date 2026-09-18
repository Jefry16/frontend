import {
	AppAlert,
	AppDialogFooter,
	AppTextInput,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
					<AppTextInput
						autoFocus
						value={handle}
						aria-label={m.handle()}
						onValueChange={setHandle}
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
