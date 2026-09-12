import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppTimeField,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { usePickupLocationForm } from "../hooks/use-pickup-location-form";
import type { PickupLocation } from "../types";

export const AppPickupLocationForm = ({
	tourOperatorId,
	pickup,
}: {
	tourOperatorId: string;
	pickup?: PickupLocation;
}) => {
	const { form, isPending, errorMessage, isEdit } = usePickupLocationForm(
		tourOperatorId,
		pickup,
	);

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions
					isPending={isPending}
					submitLabel={isEdit ? m.save_changes() : m.create()}
				/>
			}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => <AppField field={field} label={m.name()} required />}
				</form.Field>
				<form.Field name="time">
					{(field) => (
						<AppTimeField
							field={field}
							label={m.time()}
							description={m.pickup_time_hint()}
							required
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
