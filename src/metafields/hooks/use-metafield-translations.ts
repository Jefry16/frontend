import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldOwnerTypeCode } from "../types";
import { ownerMetafieldTranslationsEndpoint } from "./use-owner-metafields";

export const useMetafieldTranslationLocales = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
) =>
	useQuery({
		queryKey: queryKeys.metafieldTranslationLocales(
			tourOperatorId,
			ownerType,
			ownerId,
		),
		queryFn: async () => {
			const { data } = await authApi.get<string[]>(
				ownerMetafieldTranslationsEndpoint(tourOperatorId, ownerType, ownerId),
			);
			return data;
		},
	});

export const useMetafieldTranslation = (
	tourOperatorId: string,
	ownerType: MetafieldOwnerTypeCode,
	ownerId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.metafieldTranslation(
			tourOperatorId,
			ownerType,
			ownerId,
			locale ?? "",
		),
		enabled: locale !== undefined,
		queryFn: async () => {
			const { data } = await authApi.get<Record<string, string>>(
				`${ownerMetafieldTranslationsEndpoint(tourOperatorId, ownerType, ownerId)}/${locale}`,
			);
			return data;
		},
	});
