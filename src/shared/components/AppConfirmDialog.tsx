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
	confirmLabel: string;
	destructive?: boolean;
	pending?: boolean;
	onConfirm: () => void;
}

export function AppConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
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
					destructive={destructive}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
}
