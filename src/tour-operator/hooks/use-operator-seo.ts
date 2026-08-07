import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { OperatorSeo } from "../types";

/** The shop's own SEO defaults — the canonical text every locale falls back to. */
export const useOperatorSeo = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorSeo(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<OperatorSeo>(
				`/tour-operators/${tourOperatorId}/seo`,
			);
			return data;
		},
	});

/**
 * Resolve one media id to its asset, for the og:image preview. A local fetch
 * rather than `#/media`'s `useMediaByIds`: `media` imports `#/tour-operator`,
 * so importing it back through this module's barrel is a cycle depcheck
 * rejects. The endpoint is member-readable, same as the rest of this card.
 */
export const useOperatorSeoImage = (
	tourOperatorId: string,
	mediaId: string | null,
) =>
	useQuery({
		queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId ?? ""),
		enabled: !!mediaId,
		queryFn: async () => {
			const { data } = await authApi.get<{ id: string; url: string }>(
				`/tour-operators/${tourOperatorId}/media/${mediaId}`,
			);
			return data;
		},
	});

/**
 * Save the SEO settings. The PUT is a full replace — the backend rebuilds the
 * row from the body — so the card always sends all three fields, including an
 * `ogImageMediaId` the operator never touched.
 */
export const useOperatorSeoSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<void, AxiosError, OperatorSeo>({
		mutationFn: async (body) => {
			await authApi.put(`/tour-operators/${tourOperatorId}/seo`, body);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorSeo(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			toast.success(m.seo_saved());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};

/**
 * Upload a file to the media library and hand back its id, for the og:image
 * dropzone. Same two-step the logo card uses (multipart → 201 + Location); the
 * id is held in form state until Save, so the PUT carries it with the rest.
 */
export const useOperatorSeoImageUpload = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<string, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
			// Let axios set the multipart boundary from the FormData.
			const { headers } = await authApi.post(
				`/tour-operators/${tourOperatorId}/media`,
				fd,
			);
			const mediaId = (headers.location ?? "").split("/").pop();
			if (!mediaId) throw new Error("Missing Location header on media upload");
			return mediaId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.media(tourOperatorId),
			});
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});
};
