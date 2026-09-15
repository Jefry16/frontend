import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppAccountSettings } from "#/auth";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/account/",
)({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.account()}
				description={m.account_description()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.account() },
						]}
					/>
				}
			/>
			<AppAccountSettings />
		</AppPageShell>
	);
}
