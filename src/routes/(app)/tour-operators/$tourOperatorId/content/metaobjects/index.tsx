import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell, Button } from "@vointika/ui";
import { Plus } from "lucide-react";
import { AppMetaobjectDefinitionsList } from "#/metaobjects";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/",
)({
	component: MetaobjectsPage,
});

function MetaobjectsPage() {
	const { tourOperatorId } = Route.useParams();
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
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/content/metaobjects/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_metaobject_definition()}
						</AppLink>
					</Button>
				}
			/>
			<AppMetaobjectDefinitionsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
