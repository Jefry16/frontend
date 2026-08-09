import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { AppDialogFooter } from "./AppDialogFooter";

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
				<AppDialogFooter
					onConfirm={onConfirm}
					confirmLabel={confirmLabel}
					cancelLabel={cancelLabel}
					destructive={destructive}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
}
