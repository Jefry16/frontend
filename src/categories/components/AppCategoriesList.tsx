import { Tags } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { categoryColumns } from "../columns";

// The operator's experience categories as the standard cursor-paginated table:
// name searchable and sortable, handle read-only, created sortable.
export const AppCategoriesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => categoryColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/categories`}
			queryKey={queryKeys.categories(tourOperatorId)}
			emptyState={{
				icon: Tags,
				title: m.no_categories(),
				description: m.no_categories_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/categories/new"
						params={{ tourOperatorId }}
					>
						{m.new_category()}
					</AppNewLink>
				),
			}}
		/>
	);
};
