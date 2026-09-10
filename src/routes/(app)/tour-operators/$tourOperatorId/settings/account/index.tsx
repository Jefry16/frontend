import { createFileRoute } from "@tanstack/react-router";
import { AppAccountSettings } from "#/auth";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
