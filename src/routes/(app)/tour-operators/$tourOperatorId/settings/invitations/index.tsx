import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell, Button } from "@vointika/ui";
import { UserPlus } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb, AppLink } from "#/shared/links";
import { AppInvitationsList } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/invitations/",
)({
	component: InvitationsSettingsPage,
});

function InvitationsSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.invitations()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.invitations() },
						]}
					/>
				}
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/settings/members/new"
							params={{ tourOperatorId }}
						>
							<UserPlus />
							{m.invite_member()}
						</AppLink>
					</Button>
				}
			/>
			<AppInvitationsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
