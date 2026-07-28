import { ListTree } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { useOperatorDateTime } from "#/tour-operator";
import { menuColumns } from "../columns";

// The operator's navigation menus as the standard cursor table
// (Content → Menus). Every operator starts with main-menu + footer, so the
// empty state only shows after deleting them all.
export const AppMenusList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => menuColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/menus`}
			queryKey={queryKeys.menus(tourOperatorId)}
			emptyState={{
				icon: ListTree,
				title: m.no_menus(),
				description: m.no_menus_body(),
				action: (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/menus/new"
						params={{ tourOperatorId }}
					>
						{m.new_menu()}
					</AppNewLink>
				),
			}}
		/>
	);
};
