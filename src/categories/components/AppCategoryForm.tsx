import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useCategoryForm } from "../hooks/use-category-form";
import type { Category } from "../types";

export const AppCategoryForm = ({
	tourOperatorId,
	category,
}: {
	tourOperatorId: string;
	category?: Category;
}) => {
	const { form, isPending, errorMessage, isEdit } = useCategoryForm(
		tourOperatorId,
		category,
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
				<form.Field name="name">
					{(field) => (
						<AppField
							field={field}
							label={m.name()}
							description={isEdit ? undefined : m.category_name_hint()}
							required
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
