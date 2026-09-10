import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useCategoryForm } from "../hooks/use-category-form";
import type { Category } from "../types";

// The category form — create (no `category`) or edit (with one): the name, and
// nothing else the operator may change.
//
// The hint is create-only on purpose. The storefront handle is derived from the
// name at create and never regenerated, so "generated from this name" is true
// exactly once; on edit it would describe something the save no longer does.
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
