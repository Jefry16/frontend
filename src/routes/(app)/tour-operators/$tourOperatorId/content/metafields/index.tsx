import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMetafieldDefinitionsList } from "#/metafields";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metafields/",
)({
	component: MetafieldsPage,
});

function MetafieldsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

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
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/content/metafields/new"
							params={{ tourOperatorId }}
						>
							{m.new_metafield_definition()}
						</AppNewLink>
					)
				}
			/>
			<AppMetafieldDefinitionsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
