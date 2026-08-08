import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { POLICY_TYPE_OPTIONS } from "../format";
import { usePolicyForm } from "../hooks/use-policy-form";
import type { Policy } from "../types";

// The policy form — create (no `policy`) or edit (with one). The type picker
// only appears on create: it is the storefront address, so changing it would
// move a published URL, and the backend's update takes no type at all.
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
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
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
					<AppFormActions
						isPending={isPending}
						submitLabel={isEdit ? m.save_changes() : m.create()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
