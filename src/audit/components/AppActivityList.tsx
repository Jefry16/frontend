import { History } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { useCurrentTourOperator } from "#/tour-operator";
import { activityColumns } from "../columns";

// The operator's whole audit trail as the standard cursor table, newest first.
export const AppActivityList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const columns = useMemo(() => {
		const formatDateTime = (iso: string) =>
			new Intl.DateTimeFormat(undefined, {
				dateStyle: "medium",
				timeStyle: "short",
				timeZone,
			}).format(new Date(iso));
		return activityColumns(tourOperatorId, formatDateTime);
	}, [tourOperatorId, timeZone]);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/audit-log`}
			queryKey={queryKeys.activity(tourOperatorId)}
			emptyState={{
				icon: History,
				title: m.activity_empty(),
				description: "",
			}}
		/>
	);
};
