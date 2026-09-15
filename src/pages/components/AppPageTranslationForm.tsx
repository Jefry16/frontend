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
import { usePageTranslationForm } from "../hooks/use-page-translation-form";
import type { Page, PageTranslation } from "../types";

const hasTranslation = (t: PageTranslation) =>
	t.title !== null ||
	t.body !== null ||
	t.seoTitle !== null ||
	t.seoDescription !== null ||
	t.handle !== null;

export const AppPageTranslationForm = ({
	tourOperatorId,
	pageId,
	locale,
	canonical,
	translation,
}: {
	tourOperatorId: string;
	pageId: string;
	locale: string;
	canonical: Page;
	translation: PageTranslation;
}) => {
	const { form, errorMessage, isPending, clear, isClearing } =
		usePageTranslationForm({ tourOperatorId, pageId, locale, translation });

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
				<form.Field name="title">
					{(field) => (
						<AppField
							field={field}
							label={m.title()}
							description={m.translation_canonical({
								value: canonical.title,
							})}
						/>
					)}
				</form.Field>
				<form.Field name="body">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.page_body()}
							description={m.page_body_hint()}
							rows={12}
						/>
					)}
				</form.Field>
				<form.Field name="seoTitle">
					{(field) => <AppField field={field} label={m.seo_title()} />}
				</form.Field>
				<form.Field name="seoDescription">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.seo_description()}
							rows={3}
						/>
					)}
				</form.Field>
				<form.Field name="handle">
					{(field) => (
						<AppField
							field={field}
							label={m.slug()}
							description={m.translation_slug_help()}
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
