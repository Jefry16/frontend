import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { usePageForm } from "../hooks/use-page-form";
import type { Page } from "../types";

export const AppPageForm = ({
	tourOperatorId,
	page,
}: {
	tourOperatorId: string;
	page?: Page;
}) => {
	const { form, isPending, errorMessage, isEdit } = usePageForm(
		tourOperatorId,
		page,
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
				<form.Field name="title">
					{(field) => <AppField field={field} label={m.title()} required />}
				</form.Field>
				{!isEdit && (
					<form.Field name="handle">
						{(field) => (
							<AppField
								field={field}
								label={m.handle()}
								description={m.handle_hint()}
								required
							/>
						)}
					</form.Field>
				)}
				<form.Field name="body">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.page_body()}
							description={m.page_body_hint()}
							rows={14}
							required
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
			</FieldGroup>
		</AppFormCard>
	);
};
