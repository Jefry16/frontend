import { AppDataTable } from "@vointika/ui";
import { History } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import { activityColumns } from "../columns";

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
