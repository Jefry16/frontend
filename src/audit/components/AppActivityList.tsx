import { History } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { useOperatorDateTime } from "#/tour-operator";
import { activityColumns } from "../columns";

// The operator's whole audit trail as the standard cursor table, newest first.
export const AppActivityList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDateTime } = useOperatorDateTime();
	const columns = useMemo(
		() => activityColumns(tourOperatorId, formatDateTime),
		[tourOperatorId, formatDateTime],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/audit-log`}
			queryKey={queryKeys.activity(tourOperatorId)}
			emptyState={{
				icon: History,
				title: m.no_activity(),
				description: m.no_activity_body(),
			}}
		/>
	);
};
