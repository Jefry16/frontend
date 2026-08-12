import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldsCard } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import {
	AppOperatorBrandCard,
	AppOperatorDetailsCard,
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

// Every card writes through an ADMIN+ endpoint while its read is member-visible,
// so each takes `canWrite` and shows a read-only face to STAFF.
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
					<AppOperatorDetailsCard
						tourOperatorId={operator.id}
						canWrite={canWrite}
					/>
					<AppOperatorBrandCard
						tourOperatorId={operator.id}
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
					{/* The operator is its own owner, so ownerId is the operator's id.
					    Renders nothing until a tour-operator metafield is defined. */}
					<AppMetafieldsCard
						tourOperatorId={operator.id}
						ownerType="tour_operator"
						ownerId={operator.id}
					/>
				</>
			)}
		</AppPageShell>
	);
}
