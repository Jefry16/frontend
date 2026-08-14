import { useParams } from "@tanstack/react-router";
import { type TourOperatorSummary, useAuth } from "#/auth";

// The operator for the current route, resolved from the `$tourOperatorId` param
// against the signed-in user's memberships (the operator's summary rides the
// profile — there is no standalone GET). Null when the user isn't a member of
// that operator (or there's no operator route).
export const useCurrentTourOperator = (): TourOperatorSummary | null => {
	const params = useParams({ strict: false }) as { tourOperatorId?: string };
	const { user } = useAuth();
	const id = params.tourOperatorId;
	if (!user || !id) return null;
	return user.tourOperators.find((op) => op.id === id) ?? null;
};
