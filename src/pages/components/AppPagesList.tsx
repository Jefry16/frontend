import { FileText } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { pageColumns } from "../columns";

// The operator's CMS pages as the standard cursor table (bodies excluded
// server-side — rows stay light).
export const AppPagesList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => pageColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/pages`}
			queryKey={queryKeys.pages(tourOperatorId)}
			emptyState={{
				icon: FileText,
				title: m.no_pages(),
				description: m.no_pages_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/pages/new"
						params={{ tourOperatorId }}
					>
						{m.new_page()}
					</AppNewLink>
				),
			}}
		/>
	);
};
