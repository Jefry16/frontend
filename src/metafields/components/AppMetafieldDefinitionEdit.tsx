import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { Database } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/links";
import { useMetafieldDefinition } from "../hooks/use-metafield-definition";
import { AppMetafieldDefinitionForm } from "./AppMetafieldDefinitionForm";

export const AppMetafieldDefinitionEdit = ({
	tourOperatorId,
	definitionId,
}: {
	tourOperatorId: string;
	definitionId: string;
}) => {
	const query = useMetafieldDefinition(tourOperatorId, definitionId);

	return (
		<AppResourceView
			query={query}
			resource={m.metafield_definition()}
			icon={Database}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.metafields() }]}
				/>
			}
			loading={<AppFormSkeleton rows={3} />}
		>
			{(definition) => (
				<>
					<AppPageHeader
						title={m.edit_metafield_definition()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.metafields(),
										to: "/tour-operators/$tourOperatorId/content/metafields",
										params: { tourOperatorId },
									},
									{
										label: definition.name,
										to: "/tour-operators/$tourOperatorId/content/metafields/$definitionId",
										params: { tourOperatorId, definitionId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppMetafieldDefinitionForm
						tourOperatorId={tourOperatorId}
						definition={definition}
					/>
				</>
			)}
		</AppResourceView>
	);
};
