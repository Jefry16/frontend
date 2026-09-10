import { Mail } from "lucide-react";
import { useMemo } from "react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { invitationColumns } from "../invitation-columns";

export const AppInvitationsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const columns = useMemo(
		() => invitationColumns(tourOperatorId, formatDate),
		[tourOperatorId, formatDate],
	);

	const { canWrite } = usePermissions();

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/invitations`}
			queryKey={queryKeys.invitations(tourOperatorId)}
			emptyState={{
				icon: Mail,
				title: m.no_invitations(),
				description: m.no_invitations_body(),
				action: canWrite && (
					<AppNewLink
						to="/tour-operators/$tourOperatorId/settings/members/new"
						params={{ tourOperatorId }}
					>
						{m.invite_member()}
					</AppNewLink>
				),
			}}
		/>
	);
};
