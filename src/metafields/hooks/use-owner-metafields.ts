import { useQuery } from "@tanstack/react-query";
import { useAllPages } from "#/hooks/use-all-pages";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type {
	MetafieldDefinitionListItem,
	MetafieldOwnerTypeCode,
	MetafieldValue,
} from "../types";

/** The owner-scoped values endpoint ("experience" → …/experiences/{id}/metafields). */
export const ownerMetafieldsEndpoint = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
): string =>
	`/tour-operators/${tourOperatorId}/${
		ownerType === "experience" ? "experiences" : "pages"
	}/${ownerId}/metafields`;

// Everything the per-resource editor needs: the operator's definitions for
// this owner type (the full catalogue — unset fields still render as empty
// inputs) plus the owner's stored values. Definitions come from the whole
// bounded catalogue, filtered client-side, so the cache is shared with the
// Settings list.
export const useOwnerMetafields = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
) => {
	const catalogue = useAllPages<MetafieldDefinitionListItem>(
		queryKeys.metafieldDefinitions(tourOperatorId),
		`/tour-operators/${tourOperatorId}/metafield-definitions`,
	);

	const values = useQuery({
		queryKey: queryKeys.metafieldValues(tourOperatorId, ownerType, ownerId),
		queryFn: async () => {
			const { data } = await authApi.get<MetafieldValue[]>(
				ownerMetafieldsEndpoint(tourOperatorId, ownerType, ownerId),
			);
			return data;
		},
	});

	const definitions = catalogue.rows
		.filter((d) => d.ownerType === ownerType)
		.sort(
			(a, b) =>
				a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key),
		);

	return {
		definitions,
		values: values.data ?? [],
		isPending: catalogue.isPending || values.isPending,
		isError: catalogue.isError || values.isError,
		refetch: () => {
			catalogue.refetch();
			values.refetch();
		},
	};
};
