import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell, Button } from "@vointika/ui";
import { Plus } from "lucide-react";
import { AppMetafieldDefinitionsList } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/",
)({
	component: MetafieldsPage,
});

function MetafieldsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.metafields()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.metafields() }]}
					/>
				}
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/content/metafields/new"
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
