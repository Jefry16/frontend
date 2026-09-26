import { AppDataTable } from "@vointika/ui";
import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import { orderColumns } from "../columns";

export const AppOrdersList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDateTime } = useOperatorDateTime();
	const columns = useMemo(
		() => orderColumns(tourOperatorId, formatDateTime),
		[tourOperatorId, formatDateTime],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/orders`}
			queryKey={queryKeys.orders(tourOperatorId)}
			emptyState={{
				icon: ShoppingBag,
				title: m.no_orders(),
				description: m.no_orders_body(),
			}}
		/>
	);
};
