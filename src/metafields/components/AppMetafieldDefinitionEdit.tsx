import { Database } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useMetafieldDefinition } from "../hooks/use-metafield-definition";
import { AppMetafieldDefinitionForm } from "./AppMetafieldDefinitionForm";

// The definition edit page: fetches the record, renders the form pre-filled
// (identity read-only — only name/description are editable).
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
					items={[{ label: m.settings() }, { label: m.custom_data() }]}
				/>
			}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-9 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(definition) => (
				<>
					<AppPageHeader
						title={m.edit_metafield_definition()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.settings() },
									{
										label: m.custom_data(),
										to: "/tour-operators/$tourOperatorId/settings/custom-data",
										params: { tourOperatorId },
									},
									{
										label: definition.name,
										to: "/tour-operators/$tourOperatorId/settings/custom-data/$definitionId",
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
