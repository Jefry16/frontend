import { AppDataTable } from "@vointika/ui";
import { CalendarDays } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { slotColumns } from "../columns";

export const AppSlotsList = ({
	tourOperatorId,
	emptyAction,
}: {
	tourOperatorId: string;
	emptyAction?: ReactNode;
}) => {
	const columns = useMemo(() => slotColumns(tourOperatorId), [tourOperatorId]);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/slots`}
			queryKey={queryKeys.slots(tourOperatorId)}
			emptyState={{
				icon: CalendarDays,
				title: m.no_availability(),
				description: m.no_availability_body(),
				action: emptyAction,
			}}
		/>
	);
};
