import { ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";

// Stands in for a create/edit form a STAFF member reached anyway — hiding the
// button that leads here does not stop a bookmark or a typed URL, so the page
// says so rather than rendering a form whose save would 403.
//
// Cosmetic, like the rest of the role gating: the backend is the real gate.
// `action` is the way out (usually the list's back link).
export const AppNotPermitted = ({ action }: { action?: ReactNode }) => (
	<Card>
		<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
			<ShieldOff className="size-8 text-muted-foreground" />
			<p className="text-sm text-muted-foreground">{m.no_permission_body()}</p>
			{action}
		</CardContent>
	</Card>
);
