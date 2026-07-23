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
import * as m from "#/paraglide/messages";
import { AppConfirmDialog } from "./AppConfirmDialog";

// One action a detail view can offer. The view builds an `AppAction[]` from the
// resource's state (e.g. a PENDING invitation → Resend + Revoke) and hands it to
// AppPageActions, which decides the layout.
export interface AppAction {
	// Stable key (also the React key).
	id: string;
	label: string;
	icon?: LucideIcon;
	onSelect: () => void;
	variant?: "default" | "destructive";
	// Force this into the primary button slot. Otherwise the first
	// non-destructive action is primary.
	primary?: boolean;
	// Gate the action behind AppConfirmDialog (destructive/irreversible ones).
	confirm?: { title: string; description?: string; confirmLabel?: string };
	disabled?: boolean;
	// The action's mutation is in flight — disables it and spins.
	pending?: boolean;
}

// Renders a detail view's action set: one action → a single button; several →
// a primary button plus a "…" overflow menu holding the rest. Destructive
// actions never take the primary slot, and any action with `confirm` opens a
// confirmation dialog before firing. Drop into AppPageHeader's `actions` slot.
export function AppPageActions({ actions }: { actions: AppAction[] }) {
	// The id of the action awaiting confirmation, if any. Kept by id (not the
	// object) so `confirming` below stays live — its `pending` tracks the running
	// mutation, and the dialog auto-closes once the action leaves the set (e.g. a
	// revoked invitation goes terminal → no more actions).
	const [confirmingId, setConfirmingId] = useState<string | null>(null);
	const confirming = confirmingId
		? (actions.find((a) => a.id === confirmingId) ?? null)
		: null;

	// Fire directly, or open the confirm dialog first.
	const trigger = (action: AppAction) => {
		if (action.confirm) setConfirmingId(action.id);
		else action.onSelect();
	};

	if (actions.length === 0) return null;

	// Pick the primary: an explicit `primary`, else the first non-destructive
	// action, else the first. Destructive actions stay in the overflow menu.
	const primaryIndex = (() => {
		const explicit = actions.findIndex((a) => a.primary);
		if (explicit !== -1) return explicit;
		const firstSafe = actions.findIndex((a) => a.variant !== "destructive");
		return firstSafe !== -1 ? firstSafe : 0;
	})();
	const primary = actions[primaryIndex];
	const overflow = actions.filter((_, i) => i !== primaryIndex);

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
							aria-label={m.more_actions()}
							// outline's bg-background is a hair off-white and reads grey on a
							// white card — pin the trigger to the pure-white card surface.
							className="bg-card dark:bg-card"
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{overflow.map((action) => (
							<DropdownMenuItem
								key={action.id}
								disabled={action.disabled || action.pending}
								onSelect={() => trigger(action)}
								className={cn(
									"cursor-pointer",
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
					// Don't close here: while the mutation runs the dialog shows its
					// pending state, then auto-closes when the action leaves the set (on
					// success) — and stays open on error so the user can retry.
					onConfirm={confirming.onSelect}
				/>
			)}
		</>
	);
}
