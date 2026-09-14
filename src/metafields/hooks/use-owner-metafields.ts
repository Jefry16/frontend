import { useQuery } from "@tanstack/react-query";
import { mergeQueryState, useAllPages } from "@vointika/ui";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type {
	MetafieldDefinitionListItem,
	MetafieldOwnerTypeCode,
	MetafieldValue,
} from "../types";

// The owner is addressed by type and id, so the operator repeats its own id
// rather than relying on being the tenant in the path.
export const ownerMetafieldsEndpoint = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
): string =>
	`/tour-operators/${tourOperatorId}/metafields/${ownerType}/${ownerId}`;

export const ownerMetafieldTranslationsEndpoint = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
): string =>
	`/tour-operators/${tourOperatorId}/metafield-translations/${ownerType}/${ownerId}`;

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

	return mergeQueryState(catalogue, values, (rows, stored) => ({
		definitions: rows
			.filter((d) => d.ownerType === ownerType)
			.sort(
				(a, b) =>
					a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key),
			),
		values: stored,
	}));
};
