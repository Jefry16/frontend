import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMetaobjectDefinitionForm } from "#/metaobjects";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/new",
)({
	component: NewMetaobjectDefinitionPage,
});

function NewMetaobjectDefinitionPage() {
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
			<AppWriteGate>
				<AppMetaobjectDefinitionForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
