import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTimeField } from "#/shared/components/AppTimeField";
import { usePickupLocationForm } from "../hooks/use-pickup-location-form";
import type { PickupLocation } from "../types";

// The pickup-location form — create (no `pickup`) or edit (with one): name +
// meeting time (HH:mm, operator-local).
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
