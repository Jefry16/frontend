import type { ReactNode } from "react";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { usePermissions } from "../hooks/use-permissions";

// Lives here rather than shared/ because it calls usePermissions, and shared/
// must not import a feature module (LAW §2).
export const AppWriteGate = ({ children }: { children: ReactNode }) => {
	const { canWrite } = usePermissions();

	return canWrite ? children : <AppNotPermitted />;
};
