import { useStore } from "@tanstack/react-form";
import type { Audience } from "#/audiences";
import { Button } from "#/components/ui/button";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppDateField } from "#/shared/components/AppDateField";
import { AppTimeField } from "#/shared/components/AppTimeField";
import { useOperatorToday } from "#/tour-operator";
import { useSingleSlotForm } from "../hooks/use-single-slot-form";
import { addMinutes, rollsToNextDay } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

// One-time availability: a single departure on a chosen date. The end time
// follows the start + the experience's advertised duration until the user edits
// the end themselves. An end at or before the start means the departure runs
// past midnight — flagged inline, and the payload rolls the end date forward.
export const AppSingleSlotForm = ({
	tourOperatorId,
	experienceId,
	durationMinutes,
	audiences,
}: {
	tourOperatorId: string;
	experienceId: string;
	durationMinutes: number;
	audiences: Audience[];
}) => {
	const operatorToday = useOperatorToday();
	const { form, isPending, errorMessage } = useSingleSlotForm(
		tourOperatorId,
		experienceId,
	);
	// Two primitive selectors, NOT one returning a tuple — a fresh array every
	// snapshot never compares equal and re-renders forever.
	const startTime = useStore(form.store, (s) => s.values.startTime);
	const endTime = useStore(form.store, (s) => s.values.endTime);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}
			<FieldGroup>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<form.Field name="date">
							{(field) => (
								<AppDateField
									field={field}
									label={m.date()}
									required
									disabledDates={{ before: operatorToday }}
								/>
							)}
						</form.Field>
					</div>
					<form.Field
						name="startTime"
						listeners={{
							onChange: ({ value }) => {
								// Keep the end synced to start + advertised duration until the
								// user edits the end themselves (touched) — dontUpdateMeta so
								// the prefill itself never counts as that edit.
								if (!form.getFieldMeta("endTime")?.isTouched) {
									form.setFieldValue(
										"endTime",
										addMinutes(value as string, durationMinutes),
										{ dontUpdateMeta: true },
									);
								}
							},
						}}
					>
						{(field) => (
							<AppTimeField field={field} label={m.start_time()} required />
						)}
					</form.Field>
					<form.Field name="endTime">
						{(field) => (
							<AppTimeField
								field={field}
								label={m.end_time()}
								required
								description={
									rollsToNextDay(startTime, endTime)
										? m.ends_next_day()
										: undefined
								}
							/>
						)}
					</form.Field>
				</div>
				<form.Field name="audiencePrices">
					{(field) => (
						<AppAudiencePriceRows field={field} audiences={audiences} />
					)}
				</form.Field>
			</FieldGroup>
			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending && <Spinner className="size-4" />}
					{m.create()}
				</Button>
			</div>
		</form>
	);
};
