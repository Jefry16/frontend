import { AppDataTable } from "@vointika/ui";
import { ListTree } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppNewLink } from "#/shared/links";
import { menuColumns } from "../columns";

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

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/menus`}
			queryKey={queryKeys.menus(tourOperatorId)}
			emptyState={{
				icon: ListTree,
				title: m.no_menus(),
				description: m.no_menus_body(),
				action: canWrite && (
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
