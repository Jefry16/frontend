import { Button } from "#/components/ui/button";
import { DialogClose, DialogFooter } from "#/components/ui/dialog";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

// What AppFormActions is to a form. Cancel is a `DialogClose`, so Radix closes
// the dialog itself and no caller can forget to wire it.
export const AppDialogFooter = ({
	onConfirm,
	confirmLabel,
	disabled,
	pending,
	destructive,
}: {
	onConfirm: () => void;
	confirmLabel?: string;
	/** Beyond `pending`: an invalid or unchanged form. */
	disabled?: boolean;
	pending?: boolean;
	destructive?: boolean;
}) => (
	<DialogFooter>
		<DialogClose asChild>
			<Button type="button" variant="outline" disabled={pending}>
				{m.cancel()}
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
