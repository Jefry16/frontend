import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppInviteMemberForm } from "#/team";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/new",
)({
	component: InviteMemberPage,
});

// Single-resource form page → centered at max-w-3xl; the route owns the page
// chrome, the component is just the form card.
function InviteMemberPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
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
			<AppInviteMemberForm tourOperatorId={tourOperatorId} />
		</div>
	);
}
