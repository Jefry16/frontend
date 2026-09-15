import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppTextareaField,
	AppTranslationNotice,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppClearTranslationButton } from "#/shared/components/AppClearTranslationButton";
import { useExperienceTranslationForm } from "../hooks/use-experience-translation-form";
import type { Experience, ExperienceTranslation } from "../types";

const hasTranslation = (t: ExperienceTranslation): boolean =>
	Boolean(t.name || t.description || t.longDescription || t.handle);

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
							<AppClearTranslationButton
								isClearing={isClearing}
								disabled={isPending}
								onClick={() => clear()}
							/>
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
				<form.Field name="seoTitle">
					{(field) => (
						<AppField
							field={field}
							label={m.seo_title()}
							placeholder={canonical.seoTitle ?? undefined}
						/>
					)}
				</form.Field>
				<form.Field name="seoDescription">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.seo_description()}
							placeholder={canonical.seoDescription ?? undefined}
							rows={3}
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
