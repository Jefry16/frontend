import { Images } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { useCurrentTourOperator } from "#/tour-operator";
import { mediaColumns } from "../columns";

// The operator's media library as the standard cursor-paginated table: preview
// first, filter by type, sort by Added, infinite scroll. Upload lives in the
// page header (AppMediaUploadButton); delete is on the detail page.
export const AppMediaList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const columns = useMemo(
		() => mediaColumns(tourOperatorId, timeZone),
		[tourOperatorId, timeZone],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/media`}
			queryKey={queryKeys.media(tourOperatorId)}
			emptyState={{
				icon: Images,
				title: m.no_media(),
				description: m.no_media_body(),
			}}
		/>
	);
};
