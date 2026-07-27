import type { Audience } from "#/audiences";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppDateField } from "#/shared/components/AppDateField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTimeField } from "#/shared/components/AppTimeField";
import { RequiredMark } from "#/shared/components/RequiredMark";
import { useOperatorToday } from "#/tour-operator";
import { DAY_OPTIONS } from "../format";
import { useRecurringSlotForm } from "../hooks/use-recurring-slot-form";
import { addMinutes } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

// Recurring availability: a departure on every selected weekday between the two
// dates, all at the same times and pricing. The end time follows the start +
// the experience's advertised duration until the user edits the end themselves;
// an explicit end is never overwritten.
export const AppRecurringSlotForm = ({
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
	const { form, isPending, errorMessage } = useRecurringSlotForm(
		tourOperatorId,
		experienceId,
	);

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
				<form.Field name="days">
					{(field) => {
						const days = field.state.value as number[];
						const fieldInvalid =
							field.state.meta.isTouched && field.state.meta.errors.length > 0;
						return (
							<Field data-invalid={fieldInvalid || undefined}>
								<FieldLabel>
									{m.days()}
									<RequiredMark />
								</FieldLabel>
								<div className="flex flex-wrap gap-x-4 gap-y-2">
									{DAY_OPTIONS.map((day) => {
										const value = Number(day.value);
										return (
											<label
												key={day.value}
												htmlFor={`day-${day.value}`}
												className="flex items-center gap-2 text-sm"
											>
												<Checkbox
													id={`day-${day.value}`}
													checked={days.includes(value)}
													onCheckedChange={(checked) => {
														field.handleChange(
															checked === true
																? [...days, value].sort((a, b) => a - b)
																: days.filter((d) => d !== value),
														);
														field.handleBlur();
													}}
												/>
												{day.label}
											</label>
										);
									})}
								</div>
								{fieldInvalid && (
									<FieldError errors={field.state.meta.errors} />
								)}
							</Field>
						);
					}}
				</form.Field>
				<div className="grid gap-4 sm:grid-cols-2">
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
							<AppTimeField field={field} label={m.end_time()} required />
						)}
					</form.Field>
					<form.Field name="validFrom">
						{(field) => (
							<AppDateField
								field={field}
								label={m.valid_from()}
								required
								disabledDates={{ before: operatorToday }}
							/>
						)}
					</form.Field>
					<form.Field name="validTo">
						{(field) => (
							<AppDateField
								field={field}
								label={m.valid_to()}
								required
								disabledDates={{ before: operatorToday }}
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
			<AppFormActions isPending={isPending} submitLabel={m.create()} />
		</form>
	);
};
