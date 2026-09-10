import type { AuthUser } from "./types";

export const getPostLoginPath = (user: AuthUser): string => {
	if (user.tourOperators.length === 0) {
		return "/tour-operators/new";
	}
	const target =
		user.tourOperators.find((op) => op.isDefault) ?? user.tourOperators[0];
	return `/tour-operators/${target.id}`;
};
