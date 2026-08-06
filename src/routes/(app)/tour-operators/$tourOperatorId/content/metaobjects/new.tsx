import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectDefinitionForm } from "#/metaobjects";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/new",
)({
	component: NewMetaobjectDefinitionPage,
});

// Static "new" wins over the dynamic $definitionId sibling.
function NewMetaobjectDefinitionPage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_metaobject_definition()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.metaobjects(),
								to: "/tour-operators/$tourOperatorId/content/metaobjects",
								params: { tourOperatorId },
							},
							{ label: m.new_metaobject_definition() },
						]}
					/>
				}
			/>
			{canWrite ? (
				<AppMetaobjectDefinitionForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
