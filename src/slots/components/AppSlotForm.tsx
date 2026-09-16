import { useStore } from "@tanstack/react-form";
import {
	AppCheckboxGroupField,
	AppDateField,
	AppFormActions,
	AppFormCard,
	AppTimeField,
	FieldGroup,
} from "@vointika/ui";
import type { Audience } from "#/audiences";
import * as m from "#/paraglide/messages";
import { useOperatorToday } from "#/session";
import { DAY_OPTIONS } from "../format";
import { useSlotForm } from "../hooks/use-slot-form";
import { rollsToNextDay } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

export const AppSlotForm = ({
	tourOperatorId,
	experienceId,
	audiences,
}: {
	tourOperatorId: string;
	experienceId: string;
	audiences: Audience[];
}) => {
	const operatorToday = useOperatorToday();
	const { form, isPending, errorMessage } = useSlotForm(
		tourOperatorId,
		experienceId,
	);
	const startTime = useStore(form.store, (s) => s.values.startTime);
	const endTime = useStore(form.store, (s) => s.values.endTime);

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.create()} />
			}
		>
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
					<form.Field name="startTime">
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
								description={m.valid_to_hint()}
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
		</AppFormCard>
	);
};
