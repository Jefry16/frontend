import { AppCard } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppActivityLog } from "./AppActivityLog";

export const AppActivityCard = ({
	tourOperatorId,
	entityType,
	entityId,
}: {
	tourOperatorId: string;
	entityType: string;
	entityId: string;
}) => (
	<AppCard title={m.activity()}>
		<AppActivityLog
			tourOperatorId={tourOperatorId}
			entityType={entityType}
			entityId={entityId}
		/>
	</AppCard>
);
