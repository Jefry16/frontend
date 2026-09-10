import type { ReactNode } from "react";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { usePermissions } from "../hooks/use-permissions";

export const AppWriteGate = ({ children }: { children: ReactNode }) => {
	const { canWrite } = usePermissions();

	return canWrite ? children : <AppNotPermitted />;
};
