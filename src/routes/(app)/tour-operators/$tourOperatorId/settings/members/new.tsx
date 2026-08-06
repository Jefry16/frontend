import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppInviteMemberForm } from "#/team";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/new",
)({
	component: InviteMemberPage,
});

// Single-resource form page → centered at max-w-3xl; the route owns the page
// chrome, the component is just the form card.
function InviteMemberPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.invite_member()}
				description={m.invite_member_subtitle()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{
								label: m.members(),
								to: "/tour-operators/$tourOperatorId/settings/members",
								params: { tourOperatorId },
							},
							{ label: m.invite_member() },
						]}
					/>
				}
			/>
			{canWrite ? (
				<AppInviteMemberForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
