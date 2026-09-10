import { useCurrentTourOperator } from "./use-current-tour-operator";

export const usePermissions = () => {
	const role = useCurrentTourOperator()?.role;
	return {
		canWrite: role === "OWNER" || role === "ADMIN",
		isOwner: role === "OWNER",
	};
};
