import { createFileRoute } from "@tanstack/react-router";
import { AppAccountSettings } from "#/auth";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/account/",
)({
	component: AccountSettingsPage,
});

// The signed-in user's account (avatar + password) — a Settings section. Personal
// (not operator-scoped), but grouped with the operator settings in the rail.
function AccountSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppAccountSettings tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
