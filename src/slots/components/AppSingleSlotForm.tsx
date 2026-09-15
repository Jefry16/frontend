import { useStore } from "@tanstack/react-form";
import {
	AppDateField,
	AppFormActions,
	AppFormCard,
	AppTimeField,
	FieldGroup,
} from "@vointika/ui";
import type { Audience } from "#/audiences";
import * as m from "#/paraglide/messages";
import { useOperatorToday } from "#/session";
import { useSingleSlotForm } from "../hooks/use-single-slot-form";
import { rollsToNextDay } from "../validators/slot";
import { AppAudiencePriceRows } from "./AppAudiencePriceRows";

export const AppSingleSlotForm = ({
	tourOperatorId,
	experienceId,
	audiences,
}: {
	tourOperatorId: string;
	experienceId: string;
	audiences: Audience[];
}) => {
	const operatorToday = useOperatorToday();
	const { form, isPending, errorMessage } = useSingleSlotForm(
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
