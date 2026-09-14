import { AppDataTable } from "@vointika/ui";
import { Compass } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import {
	useOperatorCurrency,
	useOperatorDateTime,
	usePermissions,
} from "#/session";
import { AppNewLink } from "#/shared/links";
import { experienceColumns } from "../columns";

export const AppExperiencesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const currency = useOperatorCurrency();
	const columns = useMemo(
		() => experienceColumns(tourOperatorId, formatDate, currency),
		[tourOperatorId, formatDate, currency],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/experiences`}
			queryKey={queryKeys.experiences(tourOperatorId)}
			emptyState={{
				icon: Compass,
				title: m.no_experiences(),
				description: m.no_experiences_body(),
				action: canWrite && (
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
