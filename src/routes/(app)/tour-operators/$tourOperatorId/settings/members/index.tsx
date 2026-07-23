import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppMembersList } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/",
)({
	component: MembersSettingsPage,
});

// Team members settings: the roster table. Invitations (invite/revoke) land as a
// later slice on top of this same page.
function MembersSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	// Table page → full width (no mx-auto/max-w). Single-resource pages stay
	// centered at max-w-3xl; a list wants the room.
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.members()}
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
			<AppMembersList tourOperatorId={tourOperatorId} />
		</div>
	);
}
