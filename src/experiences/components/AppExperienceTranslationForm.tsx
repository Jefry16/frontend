import { Button } from "#/components/ui/button";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { AppTranslationNotice } from "#/shared/components/AppTranslationNotice";
import { useExperienceTranslationForm } from "../hooks/use-experience-translation-form";
import type { Experience, ExperienceTranslation } from "../types";

// Whether an overlay localizes anything — decides if "Clear translation" shows.
const hasTranslation = (t: ExperienceTranslation): boolean =>
	Boolean(t.name || t.description || t.longDescription || t.handle);

// One locale's translation editor. Every field is optional: left blank, the
// storefront falls back to the canonical experience, shown as the placeholder.
export const AppExperienceTranslationForm = ({
	tourOperatorId,
	experienceId,
	locale,
	canonical,
	translation,
}: {
	tourOperatorId: string;
	experienceId: string;
	locale: string;
	canonical: Experience;
	translation: ExperienceTranslation;
}) => {
	const { form, errorMessage, isPending, clear, isClearing } =
		useExperienceTranslationForm({
			tourOperatorId,
			experienceId,
			locale,
			translation,
		});

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			notice={<AppTranslationNotice />}
			actions={
				<AppFormActions
					isPending={isPending}
					disabled={isClearing}
					submitLabel={m.save_translation()}
					secondary={
						hasTranslation(translation) && (
							<Button
								type="button"
								variant="outline"
								disabled={isPending || isClearing}
								onClick={() => clear()}
							>
								{isClearing && <Spinner className="size-4" />}
								{m.clear_translation()}
							</Button>
						)
					}
				/>
			}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => (
						<AppField
							field={field}
							label={m.name()}
							placeholder={canonical.name}
						/>
					)}
				</form.Field>
				<form.Field name="handle">
					{(field) => (
						<AppField
							field={field}
							label={m.slug()}
							placeholder={canonical.handle}
							description={m.translation_slug_help()}
						/>
					)}
				</form.Field>
				<form.Field name="description">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.description()}
							placeholder={canonical.description}
						/>
					)}
				</form.Field>
				<form.Field name="longDescription">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.long_description()}
							placeholder={canonical.longDescription}
							rows={6}
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
