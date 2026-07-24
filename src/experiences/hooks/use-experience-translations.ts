import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { ExperienceTranslation } from "../types";

const base = (tourOperatorId: string, experienceId: string) =>
	`/tour-operators/${tourOperatorId}/experiences/${experienceId}/translations`;

// The experience's stored translations (only locales with a saved translation).
// Drives the translated / not-translated dots in the locale switcher.
export const useExperienceTranslations = (
	tourOperatorId: string,
	experienceId: string,
) =>
	useQuery({
		queryKey: queryKeys.experienceTranslations(tourOperatorId, experienceId),
		queryFn: async () => {
			const { data } = await authApi.get<ExperienceTranslation[]>(
				base(tourOperatorId, experienceId),
			);
			return data;
		},
	});

// One locale's overlay. The backend returns 200 with all-null fields when the
// locale is untranslated, so this always resolves to an editable form shape.
// Deferred until a locale is selected.
export const useExperienceTranslation = (
	tourOperatorId: string,
	experienceId: string,
	locale: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.experienceTranslation(
			tourOperatorId,
			experienceId,
			locale ?? "",
		),
		enabled: Boolean(locale),
		queryFn: async () => {
			const { data } = await authApi.get<ExperienceTranslation>(
				`${base(tourOperatorId, experienceId)}/${locale}`,
			);
			return data;
		},
	});
