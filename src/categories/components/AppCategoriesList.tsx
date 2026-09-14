import { AppDataTable } from "@vointika/ui";
import { Tags } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppNewLink } from "#/shared/links";
import { categoryColumns } from "../columns";

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
