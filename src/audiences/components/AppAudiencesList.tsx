import { Plus, UsersRound } from "lucide-react";
import { useMemo } from "react";
import { Button } from "#/components/ui/button";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppLink } from "#/shared/components/AppLink";
import { useCurrentTourOperator } from "#/tour-operator";
import { audienceColumns } from "../columns";

// The operator's audiences (pax pricing tiers) as the standard cursor-paginated
// table: name searchable, paxPerUnit + createdAt sortable, infinite scroll.
export const AppAudiencesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const columns = useMemo(
		() => audienceColumns(tourOperatorId, timeZone),
		[tourOperatorId, timeZone],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/audiences`}
			queryKey={queryKeys.audiences(tourOperatorId)}
			emptyState={{
				icon: UsersRound,
				title: m.no_audiences(),
				description: m.no_audiences_body(),
				action: (
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/audiences/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_audience()}
						</AppLink>
					</Button>
				),
			}}
		/>
	);
};
