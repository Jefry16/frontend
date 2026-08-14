import { Database } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { metafieldDefinitionColumns } from "../columns";

// The operator's metafield definitions as the standard cursor table (Content →
// Metafields).
export const AppMetafieldDefinitionsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => metafieldDefinitionColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/metafield-definitions`}
			queryKey={queryKeys.metafieldDefinitions(tourOperatorId)}
			emptyState={{
				icon: Database,
				title: m.no_metafield_definitions(),
				description: m.no_metafield_definitions_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/metafields/new"
						params={{ tourOperatorId }}
					>
						{m.new_metafield_definition()}
					</AppNewLink>
				),
			}}
		/>
	);
};
