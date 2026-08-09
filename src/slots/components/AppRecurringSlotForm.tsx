import type { Audience } from "#/audiences";
import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCheckboxGroupField } from "#/shared/components/AppCheckboxGroupField";
import { AppDateField } from "#/shared/components/AppDateField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTimeField } from "#/shared/components/AppTimeField";
import { useOperatorToday } from "#/tour-operator";
import { DAY_OPTIONS } from "../format";
import { useRecurringSlotForm } from "../hooks/use-recurring-slot-form";
import { addMinutes } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

// A departure on every selected weekday between the two dates. An end the user
// has edited themselves is never overwritten by the duration prefill.
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
					{(field) => (
						<AppCheckboxGroupField
							field={field}
							label={m.days()}
							required
							options={DAY_OPTIONS.map((day) => ({
								value: Number(day.value),
								label: day.label,
							}))}
						/>
					)}
				</form.Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field
						name="startTime"
						listeners={{
							onChange: ({ value }) => {
								// dontUpdateMeta, so the prefill never counts as the user
								// having edited the end themselves.
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
