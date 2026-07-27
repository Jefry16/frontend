import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { useOperatorDateTime } from "#/tour-operator";
import { memberColumns } from "../columns";

// The team roster as the standard cursor-paginated table: filter by role, sort
// by joined date, infinite scroll. The first real consumer of AppDataTable.
export const AppMembersList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => memberColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/members`}
			queryKey={queryKeys.members(tourOperatorId)}
		/>
	);
};
