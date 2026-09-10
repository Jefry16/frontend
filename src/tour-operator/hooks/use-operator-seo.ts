import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { OperatorSeo } from "../types";
import { operatorDetailQuery } from "./use-operator-details";

export const useOperatorSeo = (tourOperatorId: string) =>
	useQuery({
		...operatorDetailQuery(tourOperatorId),
		select: (operator) => operator.seo,
	});

/**
 * A `seo` present in the PATCH replaces the whole section, so the card always
 * sends all three fields — including an `ogImageMediaId` the operator never
 * touched. One key only: the sibling sections came back on the same read and
 * must not ride along into a request that replaces each one it is given.
 */
export const useOperatorSeoSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<void, AxiosError, OperatorSeo>({
		mutationFn: async (seo) => {
			await authApi.patch(`/tour-operators/${tourOperatorId}`, { seo });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
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
