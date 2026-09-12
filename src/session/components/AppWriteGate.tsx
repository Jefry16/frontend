import { AppNotPermitted } from "@vointika/ui";
import type { ReactNode } from "react";
import { usePermissions } from "../hooks/use-permissions";

export const AppWriteGate = ({ children }: { children: ReactNode }) => {
	const { canWrite } = usePermissions();

	return canWrite ? children : <AppNotPermitted />;
};
