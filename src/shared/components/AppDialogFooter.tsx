import { Button } from "#/components/ui/button";
import { DialogClose, DialogFooter } from "#/components/ui/dialog";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

/**
 * A dialog's Cancel + confirm pair. What `AppFormActions` is to a form.
 *
 * Seven dialogs wrote this out with the same shape and small disagreements:
 * one spelled the spinner `size-4` while others took the default, and only
 * `AppConfirmDialog` used `DialogClose` for Cancel — which is the right answer,
 * so it is the one here. Radix closes the dialog itself, meaning no caller can
 * forget to wire cancel, and Cancel disables mid-save like the confirm does.
 */
export const AppDialogFooter = ({
	onConfirm,
	confirmLabel,
	cancelLabel,
	disabled,
	pending,
	destructive,
}: {
	onConfirm: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Beyond `pending` — an invalid or unchanged form. */
	disabled?: boolean;
	pending?: boolean;
	destructive?: boolean;
}) => (
	<DialogFooter>
		<DialogClose asChild>
			<Button type="button" variant="outline" disabled={pending}>
				{cancelLabel ?? m.cancel()}
			</Button>
		</DialogClose>
		<Button
			type="button"
			variant={destructive ? "destructive" : "default"}
			disabled={disabled || pending}
			onClick={onConfirm}
		>
			{pending && <Spinner />}
			{confirmLabel ?? m.save_changes()}
		</Button>
	</DialogFooter>
);
