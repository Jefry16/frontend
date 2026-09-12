import { Card, CardContent, CardHeader, CardTitle } from "@vointika/ui";
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
