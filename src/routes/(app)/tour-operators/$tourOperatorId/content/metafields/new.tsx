import { createFileRoute } from "@tanstack/react-router";
import { AppMetafieldDefinitionForm } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/new",
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
							{ label: m.content() },
							{
								label: m.metafields(),
								to: "/tour-operators/$tourOperatorId/content/metafields",
								params: { tourOperatorId },
							},
							{ label: m.new_metafield_definition() },
						]}
					/>
				}
			/>
			<AppWriteGate>
				<AppMetafieldDefinitionForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
