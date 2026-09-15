import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMetafieldDefinitionForm } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/new",
)({
	component: NewMetafieldDefinitionPage,
});

function NewMetafieldDefinitionPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
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
				<AppMetafieldDefinitionForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
