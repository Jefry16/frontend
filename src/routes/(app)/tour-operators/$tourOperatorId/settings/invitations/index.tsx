import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppInvitationsList } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/invitations/",
)({
	component: InvitationsSettingsPage,
});

// Invitations settings: every invitation for this operator (all statuses),
// filterable by status/role. The invite action reuses the members "new" page.
function InvitationsSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	// Table page → full width (no mx-auto/max-w); a list wants the room.
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.invitations()}
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
		</div>
	);
}
