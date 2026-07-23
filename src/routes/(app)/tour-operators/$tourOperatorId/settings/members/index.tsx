import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
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
			<AppPageHeader title={m.members()} />
			<AppMembersList tourOperatorId={tourOperatorId} />
		</div>
	);
}
