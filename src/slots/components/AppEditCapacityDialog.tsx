import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppNumericInput } from "#/shared/components/AppNumericInput";
import type { SlotAudiencePrice } from "../types";

// Edits a slot's per-tier capacity. Every tier is listed with its booked count;
// the server floors each capacity at the seats already booked (below → 422,
// all-or-nothing), so the inputs enforce the same minimum client-side.
export const AppEditCapacityDialog = ({
	open,
	onOpenChange,
	tiers,
	pending,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tiers: SlotAudiencePrice[];
	pending: boolean;
	onSave: (capacities: { audienceId: string; capacity: number }[]) => void;
}) => {
	const [values, setValues] = useState<Record<string, string>>({});
	const valueFor = (tier: SlotAudiencePrice) =>
		values[tier.audienceId] ?? String(tier.capacity);

	const belowBooked = tiers.some(
		(t) => Number(valueFor(t) || "0") < t.bookedCount,
	);
	const incomplete = tiers.some((t) => valueFor(t) === "");

	const submit = () => {
		onSave(
			tiers.map((t) => ({
				audienceId: t.audienceId,
				capacity: Number(valueFor(t)),
			})),
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) setValues({});
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.edit_capacity()}</DialogTitle>
					<DialogDescription>{m.edit_capacity_hint()}</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3">
					{tiers.map((tier) => {
						const id = `capacity-${tier.audienceId}`;
						const below = Number(valueFor(tier) || "0") < tier.bookedCount;
						return (
							<div key={tier.audienceId} className="flex items-center gap-3">
								<Label htmlFor={id} className="flex-1 font-normal">
									{tier.audienceName}
									<span className="text-xs text-muted-foreground">
										{m.booked_count({ count: tier.bookedCount })}
									</span>
								</Label>
								<AppNumericInput
									id={id}
									className="w-24 text-right"
									value={valueFor(tier)}
									aria-invalid={below || undefined}
									onValueChange={(value) => {
										setValues((prev) => ({
											...prev,
											[tier.audienceId]: value,
										}));
									}}
								/>
							</div>
						);
					})}
					{belowBooked && (
						<p className="text-sm text-destructive">
							{m.capacity_below_booked()}
						</p>
					)}
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						{m.cancel()}
					</Button>
					<Button
						type="button"
						disabled={pending || belowBooked || incomplete}
						onClick={submit}
					>
						{pending && <Spinner className="size-4" />}
						{m.save_changes()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
