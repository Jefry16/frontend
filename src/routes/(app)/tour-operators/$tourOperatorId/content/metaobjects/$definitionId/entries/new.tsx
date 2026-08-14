import { createFileRoute } from "@tanstack/react-router";
import { Shapes } from "lucide-react";
import { AppMetaobjectForm, useMetaobjectDefinition } from "#/metaobjects";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppResourceView } from "#/shared/components/AppResourceView";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/$definitionId/entries/new",
)({
	component: NewMetaobjectPage,
});

// New entry OF a definition — the form is generated from the definition's
// field set, so the route fetches it first.
function NewMetaobjectPage() {
	const { tourOperatorId, definitionId } = Route.useParams();
	const query = useMetaobjectDefinition(tourOperatorId, definitionId);
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppResourceView
					query={query}
					resource={m.metaobject_definition()}
					icon={Shapes}
					breadcrumb={
						<AppBreadcrumb
							items={[{ label: m.content() }, { label: m.metaobjects() }]}
						/>
					}
					loading={<AppFormSkeleton rows={3} />}
				>
					{(definition) => (
						<>
							<AppPageHeader
								title={m.new_metaobject()}
								breadcrumb={
									<AppBreadcrumb
										items={[
											{ label: m.content() },
											{
												label: m.metaobjects(),
												to: "/tour-operators/$tourOperatorId/content/metaobjects",
												params: { tourOperatorId },
											},
											{
												label: definition.name,
												to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId",
												params: { tourOperatorId, definitionId },
											},
											{ label: m.new_metaobject() },
										]}
									/>
								}
							/>
							<AppMetaobjectForm
								tourOperatorId={tourOperatorId}
								definition={definition}
							/>
						</>
					)}
				</AppResourceView>
			</AppWriteGate>
		</AppPageShell>
	);
}
