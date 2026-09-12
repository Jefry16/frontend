import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMetafieldsCard } from "#/metafields";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator, usePermissions } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import {
	AppOperatorBrandCard,
	AppOperatorColorsCard,
	AppOperatorDetailsCard,
	AppOperatorSeoCard,
	AppOperatorSocialLinksCard,
	AppStorefrontPasswordCard,
} from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/general/",
)({
	component: GeneralSettingsPage,
});

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
					<AppOperatorColorsCard
						tourOperatorId={operator.id}
						canWrite={canWrite}
					/>
					<AppOperatorSocialLinksCard
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
