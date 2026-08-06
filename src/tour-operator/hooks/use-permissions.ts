import { useCurrentTourOperator } from "./use-current-tour-operator";

/**
 * What the signed-in member may do in the operator for the current route.
 *
 * **Cosmetic only.** The backend's `TourOperatorMembershipCheck` is the real
 * gate — every write re-checks the role and answers 403, so a hidden button is
 * a courtesy, never a permission. This exists so a STAFF member stops
 * discovering the limit by filling in a form and losing the input.
 *
 * Mirrors the two tiers the backend actually distinguishes: `ensureAdmin` (60
 * use cases — every write in the product) and `ensureOwner` (exactly one,
 * transferring ownership). Reads are `ensureMember`, so anything a member can
 * see stays visible: notably marking a contact message read, and the links into
 * the per-locale translation editors.
 *
 * Both flags are false off an operator route, or when the user is not a member
 * of the operator in the URL — the layout already blocks that case.
 */
export const usePermissions = () => {
	const role = useCurrentTourOperator()?.role;
	return {
		/** ADMIN or OWNER — may create, edit, publish and delete. */
		canWrite: role === "OWNER" || role === "ADMIN",
		/** OWNER only — may transfer ownership. */
		isOwner: role === "OWNER",
	};
};
