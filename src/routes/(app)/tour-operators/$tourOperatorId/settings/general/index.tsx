import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import {
	AppOperatorLogoCard,
	AppOperatorSeoCard,
	AppStorefrontPasswordCard,
	useCurrentTourOperator,
	usePermissions,
} from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/general/",
)({
	component: GeneralSettingsPage,
});

// General operator settings: logo, store access and the shop's SEO defaults.
// Every card here writes through an ADMIN+ endpoint while its read is
// member-visible, so each takes `canWrite` and shows a read-only face to STAFF.
// Single-resource page → centered at max-w-3xl.
function GeneralSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const operator = useCurrentTourOperator();
	const { canWrite } = usePermissions();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.general()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.general() },
						]}
					/>
				}
			/>
			{operator && (
				<>
					<AppOperatorLogoCard
						tourOperatorId={operator.id}
						logoUrl={operator.logoUrl}
						canWrite={canWrite}
					/>
					<AppOperatorSeoCard
						tourOperatorId={operator.id}
						canWrite={canWrite}
					/>
					<AppStorefrontPasswordCard
						tourOperatorId={operator.id}
						canWrite={canWrite}
					/>
				</>
			)}
		</AppPageShell>
	);
}
