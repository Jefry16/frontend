import { Mail, Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "#/components/ui/button";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppDataTable } from "#/shared/components/AppDataTable";
import { AppLink } from "#/shared/components/AppLink";
import { useCurrentTourOperator } from "#/tour-operator";
import { invitationColumns } from "../invitation-columns";

// The operator's invitations as the standard cursor-paginated table: all
// statuses, filter by status/role, sort by invited-by or sent date, infinite
// scroll. Read-only view (invite/resend/revoke are separate actions).
export const AppInvitationsList = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const columns = useMemo(
		() => invitationColumns(tourOperatorId, timeZone),
		[tourOperatorId, timeZone],
	);

	return (
		<AppDataTable
			columns={columns}
			endpoint={`/tour-operators/${tourOperatorId}/invitations`}
			queryKey={queryKeys.invitations(tourOperatorId)}
			emptyState={{
				icon: Mail,
				title: m.no_invitations(),
				description: m.no_invitations_body(),
				action: (
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/settings/members/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.invite_member()}
						</AppLink>
					</Button>
				),
			}}
		/>
	);
};
