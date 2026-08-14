import { useCurrentTourOperator } from "./use-current-tour-operator";

/**
 * Cosmetic only. The backend re-checks every write and answers 403, so a hidden
 * button is a courtesy, never a permission.
 *
 * A write is not automatically ADMIN+ — `RemoveTeamMemberUseCase` gates
 * self-removal on membership alone. Read the use case before assuming a tier.
 */
export const usePermissions = () => {
	const role = useCurrentTourOperator()?.role;
	return {
		canWrite: role === "OWNER" || role === "ADMIN",
		isOwner: role === "OWNER",
	};
};
