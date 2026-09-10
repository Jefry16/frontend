import { Inbox } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { contactMessageColumns } from "../columns";

export const AppContactMessagesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => contactMessageColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/contact-messages`}
			queryKey={queryKeys.contactMessages(tourOperatorId)}
			emptyState={{
				icon: Inbox,
				title: m.inbox_empty(),
				description: m.inbox_empty_body(),
			}}
		/>
	);
};
