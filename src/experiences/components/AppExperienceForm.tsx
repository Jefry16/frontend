import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCheckboxField } from "#/shared/components/AppCheckboxField";
import { AppField } from "#/shared/components/AppField";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { useExperienceForm } from "../hooks/use-experience-form";

// Create an experience — the core content (name, description, duration, cutoff,
// featured). Tags/highlights/inclusions and media are later slices; the payload
// still sends them empty so it's a complete ExperienceRequest.
export const AppExperienceForm = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { form, isPending, errorMessage } = useExperienceForm(tourOperatorId);

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
						<form.Field name="description">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.description()}
									description={m.experience_description_hint()}
									required
								/>
							)}
						</form.Field>
						<form.Field name="longDescription">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.long_description()}
									rows={6}
									required
								/>
							)}
						</form.Field>
						<div className="grid gap-4 sm:grid-cols-2">
							<form.Field name="durationMinutes">
								{(field) => (
									<AppField
										field={field}
										label={m.duration_minutes()}
										required
									/>
								)}
							</form.Field>
							<form.Field name="bookingCutoffHours">
								{(field) => (
									<AppField
										field={field}
										label={m.booking_cutoff_hours()}
										required
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="featured">
							{(field) => (
								<AppCheckboxField
									field={field}
									label={m.featured()}
									description={m.featured_hint()}
								/>
							)}
						</form.Field>
					</FieldGroup>
					<div className="flex justify-end">
						<Button type="submit" disabled={isPending}>
							{isPending && <Spinner className="size-4" />}
							{m.create()}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
