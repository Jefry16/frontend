import { Button } from "#/components/ui/button";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { AppTranslationNotice } from "#/shared/components/AppTranslationNotice";
import { useOperatorTranslationForm } from "../hooks/use-operator-translation-form";
import type { OperatorTranslation } from "../types";

const hasTranslation = (t: OperatorTranslation) =>
	t.slogan !== null ||
	t.shortDescription !== null ||
	t.seoTitle !== null ||
	t.seoDescription !== null ||
	t.passwordMessage !== null;

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
		</AppFormCard>
	);
};
