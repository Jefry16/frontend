import {
	AppDialogFooter,
	AppLabelledControl,
	AppNumericInput,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import type { SlotAudiencePrice } from "../types";

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
							<AppLabelledControl
								key={tier.audienceId}
								label={tier.audienceName}
								hint={m.booked_count({ count: tier.bookedCount })}
								htmlFor={id}
								layout="row"
								invalid={below}
							>
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
							</AppLabelledControl>
						);
					})}
					{belowBooked && (
						<p className="text-sm text-destructive">
							{m.capacity_below_booked()}
						</p>
					)}
				</div>
				<AppDialogFooter
					onConfirm={submit}
					disabled={belowBooked || incomplete}
					pending={pending}
				/>
			</DialogContent>
		</Dialog>
	);
};
