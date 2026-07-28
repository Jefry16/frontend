import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { useMenuForm } from "../hooks/use-menu-form";
import { deriveHandle } from "../validators/menu";

// The create-menu form: title + handle (a blurred title prefills an empty
// handle). Create-only — the handle is immutable and the title is renamed via
// the detail's dialog; items are added in the editor afterwards.
export const AppMenuForm = ({ tourOperatorId }: { tourOperatorId: string }) => {
	const { form, mutate, isPending, errorMessage } = useMenuForm(tourOperatorId);

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await form.handleSubmit();
						if (form.state.isValid) mutate(form.state.values);
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
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
					<AppFormActions isPending={isPending} submitLabel={m.create()} />
				</form>
			</CardContent>
		</Card>
	);
};
