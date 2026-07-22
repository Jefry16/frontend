import type { AuthUser } from "./types";

// Where to send a user after login/create. A user with no operators goes to
// onboarding; otherwise to their default operator (or the first one). Returns a
// plain path string — kept in auth (not tour-operator) so auth doesn't import
// tour-operator (which imports auth → would be a cycle).
export const getPostLoginPath = (user: AuthUser): string => {
	if (user.tourOperators.length === 0) {
		return "/tour-operators/new";
	}
	const target =
		user.tourOperators.find((op) => op.isDefault) ?? user.tourOperators[0];
	return `/tour-operators/${target.id}`;
};
