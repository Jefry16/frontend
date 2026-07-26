import { CalendarDays } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { slotColumns } from "../columns";

// The operator's departures across all experiences — soonest first (the
// server's default sort), filterable by experience/day/status. `emptyAction`
// is the first-run CTA (the route owns the experience-picker dialog, so the
// button comes from there).
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
