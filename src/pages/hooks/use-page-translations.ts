import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { PageTranslation } from "../types";

/** The translated locales (one row each) — drives the switcher's dots. */
export const usePageTranslations = (tourOperatorId: string, pageId: string) =>
	useQuery({
		queryKey: queryKeys.pageTranslations(tourOperatorId, pageId),
		queryFn: async () => {
			const { data } = await authApi.get<PageTranslation[]>(
				`/tour-operators/${tourOperatorId}/pages/${pageId}/translations`,
			);
			return data;
		},
	});

/** One locale's overlay (empty overlay when untranslated) — seeds the form. */
export const usePageTranslation = (
	tourOperatorId: string,
	pageId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.pageTranslation(tourOperatorId, pageId, locale ?? ""),
		enabled: !!locale,
		queryFn: async () => {
			const { data } = await authApi.get<PageTranslation>(
				`/tour-operators/${tourOperatorId}/pages/${pageId}/translations/${locale}`,
			);
			return data;
		},
	});
