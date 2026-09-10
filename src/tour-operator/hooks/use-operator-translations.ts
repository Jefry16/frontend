import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorTranslation } from "../types";

export const useOperatorTranslations = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorTranslations(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<OperatorTranslation[]>(
				`/tour-operators/${tourOperatorId}/translations`,
			);
			return data;
		},
	});

export const useOperatorTranslation = (
	tourOperatorId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.operatorTranslation(tourOperatorId, locale ?? ""),
		enabled: !!locale,
		queryFn: async () => {
			const { data } = await authApi.get<OperatorTranslation>(
				`/tour-operators/${tourOperatorId}/translations/${locale}`,
			);
			return data;
		},
	});
