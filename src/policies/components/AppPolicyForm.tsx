import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { POLICY_TYPE_OPTIONS } from "../format";
import { usePolicyForm } from "../hooks/use-policy-form";
import type { Policy } from "../types";

export const AppPolicyForm = ({
	tourOperatorId,
	policy,
}: {
	tourOperatorId: string;
	policy?: Policy;
}) => {
	const { form, isPending, errorMessage, isEdit } = usePolicyForm(
		tourOperatorId,
		policy,
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
				{isEdit ? null : (
					<form.Field name="type">
						{(field) => (
							<AppSelectField
								field={field}
								label={m.policy_type()}
								description={m.policy_type_hint()}
							>
								{POLICY_TYPE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</AppSelectField>
						)}
					</form.Field>
				)}
				<form.Field name="title">
					{(field) => <AppField field={field} label={m.title()} required />}
				</form.Field>
				<form.Field name="body">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.policy_body()}
							description={m.policy_body_hint()}
							rows={14}
							required
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
