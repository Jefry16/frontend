import {
	AppEmptyState,
	AppField,
	AppFormActions,
	AppFormCard,
	AppFormSkeleton,
	AppLabelledControl,
	AppNumericInput,
	AppQueryState,
	AppTimeField,
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
	useAllPages,
} from "@vointika/ui";
import type { Audience } from "#/audiences";
import { queryKeys } from "#/lib/query-keys";
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
	const audiences = useAllPages<Audience>(
		queryKeys.audiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/audiences`,
	);
	return (
		<AppQueryState query={audiences} loading={<AppFormSkeleton rows={3} />}>
			{(rows) => (
				<PickupLocationFields
					tourOperatorId={tourOperatorId}
					audiences={[...rows].sort((a, b) => a.name.localeCompare(b.name))}
					pickup={pickup}
				/>
			)}
		</AppQueryState>
	);
};

const PickupLocationFields = ({
	tourOperatorId,
	audiences,
	pickup,
}: {
	tourOperatorId: string;
	audiences: Audience[];
	pickup?: PickupLocation;
}) => {
	const { form, isPending, errorMessage, isEdit } = usePickupLocationForm(
		tourOperatorId,
		audiences,
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
				<FieldSet>
					<FieldLegend variant="label">{m.pickup_prices()}</FieldLegend>
					<FieldDescription>{m.pickup_prices_hint()}</FieldDescription>
					{audiences.length === 0 ? (
						<AppEmptyState
							variant="inline"
							title={m.pickup_prices_no_audiences()}
						/>
					) : (
						<div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
							{audiences.map((audience) => (
								<form.Field key={audience.id} name={`prices.${audience.id}`}>
									{(field) => (
										<AppLabelledControl
											label={audience.name}
											htmlFor={`pickup-price-${audience.id}`}
											invalid={field.state.meta.errors.length > 0}
											errors={field.state.meta.errors}
										>
											<AppNumericInput
												id={`pickup-price-${audience.id}`}
												decimal
												placeholder={m.free()}
												value={field.state.value ?? ""}
												onValueChange={field.handleChange}
												onBlur={field.handleBlur}
											/>
										</AppLabelledControl>
									)}
								</form.Field>
							))}
						</div>
					)}
				</FieldSet>
			</FieldGroup>
		</AppFormCard>
	);
};
