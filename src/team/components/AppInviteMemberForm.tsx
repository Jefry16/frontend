import { Button } from "#/components/ui/button";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormCard } from "#/shared/components/AppFormCard";
import { AppLink } from "#/shared/components/AppLink";
import { AppSelectField } from "#/shared/components/AppSelectField";
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
					secondary={
						<Button type="button" variant="outline" asChild>
							<AppLink
								to="/tour-operators/$tourOperatorId/settings/members"
								params={{ tourOperatorId }}
							>
								{m.cancel()}
							</AppLink>
						</Button>
					}
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
