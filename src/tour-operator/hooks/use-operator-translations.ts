import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorTranslation } from "../types";

/** The translated locales (one row each) — drives the switcher's dots. */
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

/** One locale's overlay (every field null when untranslated) — seeds the form. */
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
