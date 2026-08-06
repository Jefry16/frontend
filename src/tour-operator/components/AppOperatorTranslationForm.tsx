import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { useOperatorTranslationForm } from "../hooks/use-operator-translation-form";
import type { OperatorTranslation } from "../types";

const hasTranslation = (t: OperatorTranslation) =>
	t.slogan !== null ||
	t.shortDescription !== null ||
	t.seoTitle !== null ||
	t.seoDescription !== null ||
	t.passwordMessage !== null;

// One locale's shop-text overlay: every field optional, an empty one falling
// back to the canonical text. Clear removes the whole overlay for this locale.
//
// Unlike the experience and page translation forms, no field shows its
// canonical value as a hint. The canonical slogan and short description live on
// the brand row, which is read-path-only — the storefront renders it and no
// admin endpoint exposes it — and the canonical SEO pair would need
// `GET …/seo`, which nothing consumes yet. Rather than show the hint for one
// field out of five, the shared fallback note above the fields carries the rule.
export const AppOperatorTranslationForm = ({
	tourOperatorId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	locale: string;
	translation: OperatorTranslation;
}) => {
	const { form, errorMessage, isPending, clear, isClearing } =
		useOperatorTranslationForm({ tourOperatorId, locale, translation });

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
						<form.Field name="slogan">
							{(field) => (
								<AppField
									field={field}
									label={m.slogan()}
									description={m.slogan_hint()}
								/>
							)}
						</form.Field>
						<form.Field name="shortDescription">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.short_description()}
									description={m.short_description_hint()}
									rows={2}
								/>
							)}
						</form.Field>
						<form.Field name="seoTitle">
							{(field) => (
								<AppField
									field={field}
									label={m.seo_title()}
									description={m.seo_title_hint()}
								/>
							)}
						</form.Field>
						<form.Field name="seoDescription">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.seo_description()}
									description={m.seo_description_hint()}
									rows={3}
								/>
							)}
						</form.Field>
						<form.Field name="passwordMessage">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.visitor_message()}
									description={m.visitor_message_hint()}
									rows={3}
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
