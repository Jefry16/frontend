import { AppDataTable } from "@vointika/ui";
import { Images } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { mediaColumns } from "../columns";
import { AppMediaUploadButton } from "./AppMediaUploadButton";

export const AppMediaList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const { canWrite } = usePermissions();
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
				action: canWrite && (
					<AppMediaUploadButton tourOperatorId={tourOperatorId} />
				),
			}}
		/>
	);
};
