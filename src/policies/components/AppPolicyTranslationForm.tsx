import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppTextareaField,
	AppTranslationNotice,
	Button,
	FieldGroup,
	Spinner,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { usePolicyTranslationForm } from "../hooks/use-policy-translation-form";
import type { Policy, PolicyTranslation } from "../types";

const hasTranslation = (t: PolicyTranslation) =>
	t.title !== null || t.body !== null;

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
		</AppFormCard>
	);
};
