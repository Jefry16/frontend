import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppArrayInput } from "#/shared/components/AppArrayInput";
import { AppCheckboxField } from "#/shared/components/AppCheckboxField";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { useExperienceForm } from "../hooks/use-experience-form";
import type { Experience } from "../types";
import { AppExperienceMediaSection } from "./AppExperienceMediaSection";

// The experience content form — create (no `experience`) or edit (with one):
// name, copy, media (thumbnail + gallery via the picker), duration, cutoff,
// highlights/inclusions/tags (AppArrayInput), and featured.
export const AppExperienceForm = ({
	tourOperatorId,
	experience,
}: {
	tourOperatorId: string;
	experience?: Experience;
}) => {
	const { form, isPending, errorMessage, isEdit } = useExperienceForm(
		tourOperatorId,
		experience,
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
				<form.Field name="thumbnailMediaId">
					{(thumb) => (
						<form.Field name="mediaIds">
							{(gallery) => (
								<AppExperienceMediaSection
									tourOperatorId={tourOperatorId}
									thumbnailMediaId={thumb.state.value}
									mediaIds={gallery.state.value}
									onThumbnailChange={thumb.handleChange}
									onGalleryChange={gallery.handleChange}
								/>
							)}
						</form.Field>
					)}
				</form.Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="durationMinutes">
						{(field) => (
							<AppField field={field} label={m.duration_minutes()} required />
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
				<form.Field name="highlights">
					{(field) => <AppArrayInput field={field} label={m.highlights()} />}
				</form.Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="included">
						{(field) => (
							<AppArrayInput field={field} label={m.whats_included()} />
						)}
					</form.Field>
					<form.Field name="notIncluded">
						{(field) => (
							<AppArrayInput field={field} label={m.not_included()} />
						)}
					</form.Field>
				</div>
				<form.Field name="tags">
					{(field) => <AppArrayInput field={field} label={m.tags()} />}
				</form.Field>
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
		</AppFormCard>
	);
};
