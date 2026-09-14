import { Shapes } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/links";
import { metaobjectDefinitionColumns } from "../columns";

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
