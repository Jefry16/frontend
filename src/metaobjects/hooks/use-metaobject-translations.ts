import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";

export const useMetaobjectTranslationLocales = (
	tourOperatorId: string,
	metaobjectId: string,
) =>
	useQuery({
		queryKey: queryKeys.metaobjectTranslations(tourOperatorId, metaobjectId),
		queryFn: async () => {
			const { data } = await authApi.get<string[]>(
				`/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}/field-translations`,
			);
			return data;
		},
	});

export const useMetaobjectTranslation = (
	tourOperatorId: string,
	metaobjectId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.metaobjectTranslation(
			tourOperatorId,
			metaobjectId,
			locale ?? "",
		),
		enabled: !!locale,
		queryFn: async () => {
			const { data } = await authApi.get<Record<string, string>>(
				`/tour-operators/${tourOperatorId}/metaobjects/${metaobjectId}/field-translations/${locale}`,
			);
			return data;
		},
	});
