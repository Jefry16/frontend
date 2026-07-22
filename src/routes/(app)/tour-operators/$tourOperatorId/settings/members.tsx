import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members",
)({
	component: MembersSettingsPage,
});

// Team members settings. A stub for now — the roster + invitations UI lands with
// its feature slice; this just holds the page header inside the settings space.
function MembersSettingsPage() {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppPageHeader title={m.members()} />
		</div>
	);
}
