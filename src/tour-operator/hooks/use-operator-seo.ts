import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { OperatorSeo } from "../types";

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

// Fetched here rather than through `#/media`'s useMediaByIds: `media` imports
// `#/tour-operator`, so reaching back through the barrel is a cycle.
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

// The PUT is a full replace, so the card always sends all three fields —
// including an `ogImageMediaId` the operator never touched.
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

// The id is held in form state until Save, so the PUT carries it with the rest.
export const useOperatorSeoImageUpload = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<string, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
			// No Content-Type header: axios derives the multipart boundary itself.
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
