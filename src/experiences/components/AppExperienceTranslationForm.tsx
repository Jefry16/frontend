import { Button } from "#/components/ui/button";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppArrayInput } from "#/shared/components/AppArrayInput";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { useExperienceTranslationForm } from "../hooks/use-experience-translation-form";
import type { Experience, ExperienceTranslation } from "../types";

// Whether an overlay localizes anything — decides if "Clear translation" shows.
const hasTranslation = (t: ExperienceTranslation): boolean =>
	Boolean(
		t.name ||
			t.description ||
			t.longDescription ||
			t.handle ||
			t.highlights?.length ||
			t.included?.length ||
			t.notIncluded?.length,
	);

// One locale's translation editor. Every field is optional: left blank, the
// storefront falls back to the canonical experience — shown as the input
// placeholder (text) or a helper line (lists) so the operator sees the fallback.
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

	// The canonical list shown under array fields so the operator knows the
	// fallback when a field is left empty.
	const canonicalList = (value: string[]): string | undefined =>
		value.length
			? m.translation_canonical({ value: value.join(", ") })
			: undefined;

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			notice={
				<AppAlert
					variant="info"
					title={m.translation()}
					description={m.translation_fallback_help()}
				/>
			}
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
				<form.Field name="highlights">
					{(field) => (
						<AppArrayInput
							field={field}
							label={m.highlights()}
							description={canonicalList(canonical.highlights)}
						/>
					)}
				</form.Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="included">
						{(field) => (
							<AppArrayInput
								field={field}
								label={m.whats_included()}
								description={canonicalList(canonical.included)}
							/>
						)}
					</form.Field>
					<form.Field name="notIncluded">
						{(field) => (
							<AppArrayInput
								field={field}
								label={m.not_included()}
								description={canonicalList(canonical.notIncluded)}
							/>
						)}
					</form.Field>
				</div>
			</FieldGroup>
		</AppFormCard>
	);
};
