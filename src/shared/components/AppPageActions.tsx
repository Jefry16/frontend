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
	// Gate the action behind AppConfirmDialog (destructive/irreversible ones).
	confirm?: { title: string; description?: string; confirmLabel?: string };
	disabled?: boolean;
	// The action's mutation is in flight — disables it and spins.
	pending?: boolean;
	// A STAFF member may run this too. Absent means ADMIN+ only, which is the
	// right default: nearly every write in the product is behind the backend's
	// `ensureAdmin`. Set it only where the backend's check is `ensureMember`
	// (reading translations, the inbox read-state) or membership alone (leaving
	// the team) — the flag is a claim about the backend, not a UI preference.
	member?: boolean;
}

// Renders a detail view's action set: one action → a single button; several →
// a primary button plus a "…" overflow menu holding the rest. Destructive
// actions never take the primary slot, and any action with `confirm` opens a
// confirmation dialog before firing. Drop into AppPageHeader's `actions` slot.
//
// `canWrite` arrives as a prop because `shared/` may not import a feature module
// and `usePermissions` lives in `tour-operator/` — the same reason every
// translation card takes it. It is required so a new call site cannot forget the
// gate: omitting it fails typecheck instead of quietly showing STAFF a 403.
export function AppPageActions({
	actions,
	canWrite,
}: {
	actions: AppAction[];
	canWrite: boolean;
}) {
	// The id of the action awaiting confirmation, if any. Kept by id (not the
	// object) so `confirming` below stays live — its `pending` tracks the running
	// mutation, and the dialog auto-closes once the action leaves the set (e.g. a
	// revoked invitation goes terminal → no more actions).
	const [confirmingId, setConfirmingId] = useState<string | null>(null);

	// Everything below works off `visible`, never `actions` — the tier decides
	// what exists here, including which action can be primary.
	const visible = actions.filter((action) => canWrite || action.member);
	const confirming = confirmingId
		? (visible.find((a) => a.id === confirmingId) ?? null)
		: null;

	// Fire directly, or open the confirm dialog first.
	const trigger = (action: AppAction) => {
		if (action.confirm) setConfirmingId(action.id);
		else action.onSelect();
	};

	if (visible.length === 0) return null;

	// The primary slot takes the first non-destructive action, else the first —
	// a destructive one never leads. The rest go to the overflow menu.
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
							aria-label={m.more_actions()}
							// outline's bg-background is a hair off-white and reads grey on a
							// white card — pin the trigger to the pure-white card surface.
							className="bg-card dark:bg-card"
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					{/* The vendored content pins itself to the trigger's width — here that's
					    the tiny "…" button, clipping labels. Size to the content instead. */}
					<DropdownMenuContent align="end" className="w-auto min-w-40">
						{overflow.map((action) => (
							<DropdownMenuItem
								key={action.id}
								disabled={action.disabled || action.pending}
								onSelect={() => trigger(action)}
								className={cn(
									// Labels stay on one line — the menu grows instead of wrapping.
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
					// Don't close here: while the mutation runs the dialog shows its
					// pending state, then auto-closes when the action leaves the set (on
					// success) — and stays open on error so the user can retry.
					onConfirm={confirming.onSelect}
				/>
			)}
		</>
	);
}
