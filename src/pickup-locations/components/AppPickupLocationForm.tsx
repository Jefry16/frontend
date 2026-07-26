import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
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
		<Card>
			<CardContent>
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
					<div className="flex justify-end">
						<Button type="submit" disabled={isPending}>
							{isPending && <Spinner className="size-4" />}
							{isEdit ? m.save_changes() : m.create()}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
