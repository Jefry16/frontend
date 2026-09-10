import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useMenuForm } from "../hooks/use-menu-form";
import { deriveHandle } from "../validators/menu";

export const AppMenuForm = ({ tourOperatorId }: { tourOperatorId: string }) => {
	const { form, isPending, errorMessage } = useMenuForm(tourOperatorId);

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.create()} />
			}
		>
			<FieldGroup>
				<form.Field
					name="title"
					listeners={{
						onBlur: () => {
							if (!form.getFieldValue("handle")) {
								form.setFieldValue(
									"handle",
									deriveHandle(form.getFieldValue("title")),
								);
							}
						},
					}}
				>
					{(field) => <AppField field={field} label={m.title()} required />}
				</form.Field>
				<form.Field name="handle">
					{(field) => (
						<AppField
							field={field}
							label={m.handle()}
							description={m.menu_handle_hint()}
							required
						/>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
