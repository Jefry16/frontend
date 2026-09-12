import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Spinner } from "#/components/ui/spinner";
import { cn } from "#/lib/utils";
import { useUiLabels } from "../labels";
import { AppConfirmDialog } from "./AppConfirmDialog";

export interface AppAction {
	id: string;
	label: string;
	icon?: LucideIcon;
	onSelect: () => void;
	variant?: "default" | "destructive";
	confirm?: { title: string; description?: string; confirmLabel?: string };
	disabled?: boolean;
	pending?: boolean;
	member?: boolean;
}

export function AppPageActions({
	actions,
	canWrite,
}: {
	actions: AppAction[];
	canWrite: boolean;
}) {
	const labels = useUiLabels();
	const [confirmingId, setConfirmingId] = useState<string | null>(null);

	const visible = actions.filter((action) => canWrite || action.member);
	const confirming = confirmingId
		? (visible.find((a) => a.id === confirmingId) ?? null)
		: null;

	const trigger = (action: AppAction) => {
		if (action.confirm) setConfirmingId(action.id);
		else action.onSelect();
	};

	if (visible.length === 0) return null;

	const firstSafe = visible.findIndex((a) => a.variant !== "destructive");
	const primaryIndex = firstSafe !== -1 ? firstSafe : 0;
	const primary = visible[primaryIndex];
	const overflow = visible.filter((_, i) => i !== primaryIndex);

	return (
		<>
			<Button
				variant={primary.variant === "destructive" ? "destructive" : "default"}
				onClick={() => trigger(primary)}
				disabled={primary.disabled || primary.pending}
			>
				{primary.pending ? (
					<Spinner className="size-4" />
				) : (
					primary.icon && <primary.icon />
				)}
				{primary.label}
			</Button>

			{overflow.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							aria-label={labels.moreActions}
							className="bg-card dark:bg-card"
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					{/* The vendored content pins itself to the trigger's width — here the
					    tiny "…" button, which clips labels. Size to the content instead. */}
					<DropdownMenuContent align="end" className="w-auto min-w-40">
						{overflow.map((action) => (
							<DropdownMenuItem
								key={action.id}
								disabled={action.disabled || action.pending}
								onSelect={() => trigger(action)}
								className={cn(
									"cursor-pointer whitespace-nowrap",
									action.variant === "destructive" &&
										"text-destructive focus:text-destructive",
								)}
							>
								{action.icon && <action.icon />}
								{action.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{confirming && (
				<AppConfirmDialog
					open
					onOpenChange={(open) => {
						if (!open) setConfirmingId(null);
					}}
					title={confirming.confirm?.title ?? confirming.label}
					description={confirming.confirm?.description}
					confirmLabel={confirming.confirm?.confirmLabel ?? confirming.label}
					destructive={confirming.variant === "destructive"}
					pending={confirming.pending}
					onConfirm={confirming.onSelect}
				/>
			)}
		</>
	);
}
