import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";
import { AppMembersList } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/",
)({
	component: MembersSettingsPage,
});

function MembersSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.members()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.members() },
						]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/settings/members/new"
							params={{ tourOperatorId }}
						>
							{m.invite_member()}
						</AppNewLink>
					)
				}
			/>
			<AppMembersList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
