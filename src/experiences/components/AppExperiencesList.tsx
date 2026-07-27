import { Compass } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { useOperatorDateTime } from "#/tour-operator";
import { experienceColumns } from "../columns";

// The operator's experiences as the standard cursor-paginated table: thumbnail,
// name, publish status, duration, created — sort by name/created, infinite
// scroll. Read-only browse for now (create/edit/publish land as later slices).
export const AppExperiencesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => experienceColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/experiences`}
			queryKey={queryKeys.experiences(tourOperatorId)}
			emptyState={{
				icon: Compass,
				title: m.no_experiences(),
				description: m.no_experiences_body(),
				action: (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/experiences/new"
						params={{ tourOperatorId }}
					>
						{m.new_experience()}
					</AppNewLink>
				),
			}}
		/>
	);
};
