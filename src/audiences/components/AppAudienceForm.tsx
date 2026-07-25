import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { useAudienceForm } from "../hooks/use-audience-form";
import type { Audience } from "../types";

// The audience form — create (no `audience`) or edit (with one): name + pax per
// unit. Renaming / re-paxing an audience also updates existing departures'
// pricing rows server-side (identity fields sync; prices stay frozen).
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
