import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { usePolicyTranslationForm } from "../hooks/use-policy-translation-form";
import type { Policy, PolicyTranslation } from "../types";

const hasTranslation = (t: PolicyTranslation) =>
	t.title !== null || t.body !== null;

// One locale's overlay: both fields optional, an empty one falling back to the
// canonical policy shown as each field's hint. Clear removes the whole overlay.
export const AppPolicyTranslationForm = ({
	tourOperatorId,
	policyId,
	locale,
	canonical,
	translation,
}: {
	tourOperatorId: string;
	policyId: string;
	locale: string;
	canonical: Policy;
	translation: PolicyTranslation;
}) => {
	const { form, errorMessage, isPending, clear, isClearing } =
		usePolicyTranslationForm({
			tourOperatorId,
			policyId,
			locale,
			translation,
		});

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
									placeholder={canonical.title}
								/>
							)}
						</form.Field>
						<form.Field name="body">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.policy_body()}
									description={m.policy_body_hint()}
									rows={14}
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
