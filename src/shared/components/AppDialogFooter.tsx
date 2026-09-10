import { Button } from "#/components/ui/button";
import { DialogClose, DialogFooter } from "#/components/ui/dialog";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

export const AppDialogFooter = ({
	onConfirm,
	confirmLabel,
	disabled,
	pending,
	destructive,
}: {
	onConfirm: () => void;
	confirmLabel?: string;
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
