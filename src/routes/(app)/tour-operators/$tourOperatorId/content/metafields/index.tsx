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
