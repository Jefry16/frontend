import { ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";

export const AppNotPermitted = ({ action }: { action?: ReactNode }) => (
	<Card>
		<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
			<ShieldOff className="size-8 text-muted-foreground" />
			<p className="text-sm text-muted-foreground">{m.no_permission_body()}</p>
			{action}
		</CardContent>
	</Card>
);
