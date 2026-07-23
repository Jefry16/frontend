import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	// The affirmative button label (e.g. "Revoke"); Cancel is always offered.
	confirmLabel: string;
	cancelLabel?: string;
	// Style the confirm button as destructive (irreversible actions).
	destructive?: boolean;
	// While the action runs: disables both buttons and spins the confirm.
	pending?: boolean;
	onConfirm: () => void;
}

// A modal confirmation gate for irreversible/destructive actions. Kept dumb: the
// caller owns the open state and the mutation; this just asks and reports the
// pending state. Pairs with AppPageActions (an action's `confirm` routes here).
export function AppConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel,
	destructive,
	pending,
	onConfirm,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={pending}>
							{cancelLabel ?? m.cancel()}
						</Button>
					</DialogClose>
					<Button
						variant={destructive ? "destructive" : "default"}
						onClick={onConfirm}
						disabled={pending}
					>
						{pending && <Spinner className="size-4" />}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
