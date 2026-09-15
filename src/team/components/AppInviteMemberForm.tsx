import {
	AppField,
	AppFormActions,
	AppFormCard,
	AppSelectField,
	FieldGroup,
	SelectItem,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { roleLabel } from "../format";
import { useInviteMemberForm } from "../hooks/use-invite-member-form";

export const AppInviteMemberForm = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { form, isPending, errorMessage } = useInviteMemberForm(tourOperatorId);

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions
					isPending={isPending}
					submitLabel={m.send_invitation()}
				/>
			}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => (
						<AppField field={field} label={m.name()} autoComplete="name" />
					)}
				</form.Field>
				<form.Field name="email">
					{(field) => (
						<AppField
							field={field}
							label={m.email()}
							type="email"
							autoComplete="email"
						/>
					)}
				</form.Field>
				<form.Field name="role">
					{(field) => (
						<AppSelectField
							field={field}
							label={m.role()}
							placeholder={m.select_option()}
						>
							<SelectItem value="ADMIN">{roleLabel("ADMIN")}</SelectItem>
							<SelectItem value="STAFF">{roleLabel("STAFF")}</SelectItem>
						</AppSelectField>
					)}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};
