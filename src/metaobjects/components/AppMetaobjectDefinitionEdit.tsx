import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { Shapes } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppBreadcrumb } from "#/shared/links";
import { useMetaobjectDefinition } from "../hooks/use-metaobject-definition";
import { AppMetaobjectDefinitionForm } from "./AppMetaobjectDefinitionForm";

export const AppMetaobjectDefinitionEdit = ({
	tourOperatorId,
	definitionId,
}: {
	tourOperatorId: string;
	definitionId: string;
}) => {
	const query = useMetaobjectDefinition(tourOperatorId, definitionId);

	return (
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
						title={m.edit_metaobject_definition()}
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
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppMetaobjectDefinitionForm
						tourOperatorId={tourOperatorId}
						definition={definition}
					/>
				</>
			)}
		</AppResourceView>
	);
};
