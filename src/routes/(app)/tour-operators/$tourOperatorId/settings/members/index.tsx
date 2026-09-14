import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell, Button } from "@vointika/ui";
import { UserPlus } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb, AppLink } from "#/shared/links";
import { AppMembersList } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/",
)({
	component: MembersSettingsPage,
});

function MembersSettingsPage() {
	const { tourOperatorId } = Route.useParams();
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
		</AppPageShell>
	);
}
