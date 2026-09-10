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

export const useOperatorSeoSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<void, AxiosError, OperatorSeo>({
		mutationFn: async (seo) => {
			// All three fields every time: this section is replaced whole, so a partial
			// body clears the share image the operator never touched.
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

export const useOperatorSeoImageUpload = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<string, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
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
