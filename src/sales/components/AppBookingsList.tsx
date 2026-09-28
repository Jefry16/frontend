import { AppDataTable } from "@vointika/ui";
import { Ticket } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorCurrency } from "#/session";
import { bookingColumns } from "../columns";

export const AppBookingsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const currency = useOperatorCurrency();
	const columns = useMemo(
		() => bookingColumns(tourOperatorId, currency),
		[tourOperatorId, currency],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/bookings`}
			queryKey={queryKeys.bookings(tourOperatorId)}
			emptyState={{
				icon: Ticket,
				title: m.no_bookings(),
				description: m.no_bookings_body(),
			}}
		/>
	);
};
