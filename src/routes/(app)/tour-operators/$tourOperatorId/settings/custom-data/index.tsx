import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { AppMetafieldDefinitionsList } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/custom-data/",
)({
	component: CustomDataSettingsPage,
});

// Custom data settings: the metafield-definition catalogue. Values are edited
// on each experience/page detail.
function CustomDataSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.custom_data()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.custom_data() },
						]}
					/>
				}
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/settings/custom-data/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_metafield_definition()}
						</AppLink>
					</Button>
				}
			/>
			<AppMetafieldDefinitionsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
