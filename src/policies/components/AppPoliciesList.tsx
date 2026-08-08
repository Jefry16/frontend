import { Scale } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { policyColumns } from "../columns";

// The operator's store policies as the standard cursor table. Four rows will
// never paginate, but this is tenant data and speaks the same grammar as every
// other tenant list.
export const AppPoliciesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const { canWrite } = usePermissions();
	const columns = useMemo(
		() => policyColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/policies`}
			queryKey={queryKeys.policies(tourOperatorId)}
			emptyState={{
				icon: Scale,
				title: m.no_policies(),
				description: m.no_policies_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/policies/new"
						params={{ tourOperatorId }}
					>
						{m.new_policy()}
					</AppNewLink>
				),
			}}
		/>
	);
};
