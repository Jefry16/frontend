import { createFileRoute } from "@tanstack/react-router";
import { AppAccountSettings } from "#/auth";

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
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppAccountSettings tourOperatorId={tourOperatorId} />
		</div>
	);
}
