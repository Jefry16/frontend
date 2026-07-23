import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { roleLabel } from "../format";
import { useInviteMemberForm } from "../hooks/use-invite-member-form";

// The invite-a-member page (/settings/members/new): email + role → POST an
// invitation, then back to the roster. A single-resource form page, so it's
// centered (not the full-width table treatment).
export const AppInviteMemberForm = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { form, isPending, errorMessage } = useInviteMemberForm(tourOperatorId);

	return (
		<div className="mx-auto flex w-full max-w-lg flex-col gap-8 p-6">
			<AppPageHeader
				title={m.invite_member()}
				description={m.invite_member_subtitle()}
			/>
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
							<form.Field name="name">
								{(field) => (
									<AppField
										field={field}
										label={m.name()}
										autoComplete="name"
									/>
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
						<div className="flex justify-end gap-2">
							<Button type="button" variant="outline" asChild>
								<AppLink
									to="/tour-operators/$tourOperatorId/settings/members"
									params={{ tourOperatorId }}
								>
									{m.cancel()}
								</AppLink>
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Spinner />}
								{m.send_invitation()}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
