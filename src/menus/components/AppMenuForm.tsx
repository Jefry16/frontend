import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { useMenuForm } from "../hooks/use-menu-form";
import { deriveHandle } from "../validators/menu";

// The create-menu form: title + handle (a blurred title prefills an empty
// handle). Create-only — the handle is immutable and the title is renamed via
// the detail's dialog; items are added in the editor afterwards.
export const AppMenuForm = ({ tourOperatorId }: { tourOperatorId: string }) => {
	const { form, mutate, isPending, errorMessage } = useMenuForm(tourOperatorId);

	// useMenuForm leaves useForm's onSubmit unwired, so validation and the POST
	// are two steps here rather than one.
	const submit = async () => {
		await form.handleSubmit();
		if (form.state.isValid) mutate(form.state.values);
	};

	return (
		<AppFormCard
			onSubmit={submit}
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
