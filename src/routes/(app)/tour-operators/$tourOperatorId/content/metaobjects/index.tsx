import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMetaobjectDefinitionsList } from "#/metaobjects";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/",
)({
	component: MetaobjectsPage,
});

function MetaobjectsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.metaobjects()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.metaobjects() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/content/metaobjects/new"
							params={{ tourOperatorId }}
						>
							{m.new_metaobject_definition()}
						</AppNewLink>
					)
				}
			/>
			<AppMetaobjectDefinitionsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
