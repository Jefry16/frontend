import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { usePageTranslationForm } from "../hooks/use-page-translation-form";
import type { Page, PageTranslation } from "../types";

const hasTranslation = (t: PageTranslation) =>
	t.title !== null ||
	t.body !== null ||
	t.seoTitle !== null ||
	t.seoDescription !== null ||
	t.slug !== null;

// One locale's overlay form: every field optional (empty = fall back to the
// canonical content, shown as each field's placeholder-style hint). Clear
// removes the whole overlay.
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
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<AppAlert
						variant="info"
						title={m.translation()}
						description={m.translation_fallback_help()}
					/>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
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
						<form.Field name="slug">
							{(field) => (
								<AppField
									field={field}
									label={m.slug()}
									description={m.translation_slug_help()}
								/>
							)}
						</form.Field>
					</FieldGroup>
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
				</form>
			</CardContent>
		</Card>
	);
};
