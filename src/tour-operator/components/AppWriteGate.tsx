import type { ReactNode } from "react";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { usePermissions } from "../hooks/use-permissions";

// The body of a create or edit page, shown only to ADMIN+. Twenty routes wrote
// this as `usePermissions()` plus a `canWrite ? … : <AppNotPermitted />`
// ternary, which is two imports and a hook call to say one thing.
//
// It lives here rather than in shared/ because it calls usePermissions, and
// shared/ must not import a feature module (§2). Routes reach it through the
// barrel, like any other module component.
//
// Cosmetic, like the rest of the role gating: the backend re-checks every write
// and answers 403. This exists so a STAFF member does not discover the limit by
// filling in a form and losing the input.
//
// Children moved from a ternary branch into a prop, so React now builds the
// element either way — but it still never *calls* the component when access is
// denied, which is what keeps a query inside those children from firing. (A
// query the route itself runs, above the gate, always fires; two `new` pages
// resolve a parent record that way.)
export const AppWriteGate = ({ children }: { children: ReactNode }) => {
	const { canWrite } = usePermissions();

	return canWrite ? children : <AppNotPermitted />;
};
