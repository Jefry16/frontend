import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldDefinitionForm } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/custom-data/new",
)({
	component: NewMetafieldDefinitionPage,
});

// Static "new" wins over the dynamic $definitionId sibling.
function NewMetafieldDefinitionPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_metafield_definition()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{
								label: m.custom_data(),
								to: "/tour-operators/$tourOperatorId/settings/custom-data",
								params: { tourOperatorId },
							},
							{ label: m.new_metafield_definition() },
						]}
					/>
				}
			/>
			<AppMetafieldDefinitionForm tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
