import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useAudienceForm } from "../hooks/use-audience-form";
import type { Audience } from "../types";

export const AppAudienceForm = ({
	tourOperatorId,
	audience,
}: {
	tourOperatorId: string;
	audience?: Audience;
}) => {
	const { form, isPending, errorMessage, isEdit } = useAudienceForm(
		tourOperatorId,
		audience,
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
				<form.Field name="paxPerUnit">
					{(field) => (
						<AppField
							field={field}
							label={m.pax_per_unit()}
							description={m.pax_per_unit_hint()}
							required
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
