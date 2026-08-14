import { Images } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { mediaColumns } from "../columns";
import { AppMediaUploadButton } from "./AppMediaUploadButton";

// The operator's media library as the standard cursor-paginated table: preview
// first, filter by type, sort by Added, infinite scroll. Upload lives in the
// page header (AppMediaUploadButton); delete is on the detail page.
export const AppMediaList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => mediaColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
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
				action: <AppMediaUploadButton tourOperatorId={tourOperatorId} />,
			}}
		/>
	);
};
