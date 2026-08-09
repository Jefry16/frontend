import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
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
