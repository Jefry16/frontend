import { Shapes } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { metaobjectDefinitionColumns } from "../columns";

// The operator's metaobject definitions as the standard cursor table
// (Content → Metaobjects).
export const AppMetaobjectDefinitionsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => metaobjectDefinitionColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/metaobject-definitions`}
			queryKey={queryKeys.metaobjectDefinitions(tourOperatorId)}
			emptyState={{
				icon: Shapes,
				title: m.no_metaobject_definitions(),
				description: m.no_metaobject_definitions_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/metaobjects/new"
						params={{ tourOperatorId }}
					>
						{m.new_metaobject_definition()}
					</AppNewLink>
				),
			}}
		/>
	);
};
