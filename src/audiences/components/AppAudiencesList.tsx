import { AppDataTable } from "@vointika/ui";
import { Target } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppNewLink } from "#/shared/links";
import { audienceColumns } from "../columns";

export const AppAudiencesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => audienceColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/audiences`}
			queryKey={queryKeys.audiences(tourOperatorId)}
			emptyState={{
				icon: Target,
				title: m.no_audiences(),
				description: m.no_audiences_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/audiences/new"
						params={{ tourOperatorId }}
					>
						{m.new_audience()}
					</AppNewLink>
				),
			}}
		/>
	);
};
