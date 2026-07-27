import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppActivityLog } from "./AppActivityLog";

// The detail-page Activity section: the titled card around one entity's audit
// timeline. Drop it at the end of any audited entity's card stack.
export const AppActivityCard = ({
	tourOperatorId,
	entityType,
	entityId,
}: {
	tourOperatorId: string;
	entityType: string;
	entityId: string;
}) => (
	<Card>
		<CardHeader>
			<CardTitle>{m.activity()}</CardTitle>
		</CardHeader>
		<CardContent>
			<AppActivityLog
				tourOperatorId={tourOperatorId}
				entityType={entityType}
				entityId={entityId}
			/>
		</CardContent>
	</Card>
);
