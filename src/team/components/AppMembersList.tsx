import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import { useOperatorDateTime } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { memberColumns } from "../columns";

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
