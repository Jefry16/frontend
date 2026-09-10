import { useParams } from "@tanstack/react-router";
import { type TourOperatorSummary, useAuth } from "#/auth";

export const useCurrentTourOperator = (): TourOperatorSummary | null => {
	const params = useParams({ strict: false }) as { tourOperatorId?: string };
	const { user } = useAuth();
	const id = params.tourOperatorId;
	if (!user || !id) return null;
	return user.tourOperators.find((op) => op.id === id) ?? null;
};
