import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppAccountSettings } from "#/auth";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/account/",
)({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppAccountSettings tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
