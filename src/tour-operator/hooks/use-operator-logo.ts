import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The operator-logo actions. Setting a logo is a TWO-STEP backend flow: upload
// the file to the media library (multipart → 201 + Location), then point the
// operator's logo at that media id (PUT). Both refresh the auth profile, since
// the resolved logoUrl lives only in profile.tourOperators[] (no operator GET).
//
// Orphan risk: if the media POST succeeds but the PUT fails, the uploaded asset
// stays unreferenced in the library. The contract exposes no client media-delete,
// so we don't compensate — the error surfaces and a retry re-uploads + re-points.
export const useOperatorLogo = (tourOperatorId: string) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const base = `/tour-operators/${tourOperatorId}`;

	const upload = useMutation<void, AxiosError, File>({
		mutationFn: async (file) => {
			const fd = new FormData();
			fd.append("file", file);
			// Let axios set the multipart boundary from the FormData — never hand-set
			// Content-Type. 201 + Location: .../media/{mediaId}, empty body.
			const { headers } = await authApi.post(`${base}/media`, fd);
			const mediaId = (headers.location ?? "").split("/").pop();
			if (!mediaId) throw new Error("Missing Location header on media upload");
			await authApi.put(`${base}/logo`, { mediaId });
		},
		onSuccess: async () => {
			// Wait for the profile so the switcher Avatar shows the new URL before
			// the success toast.
			await refreshUser();
			// The upload added a media row and the swap appended audit entries.
			queryClient.invalidateQueries({
				queryKey: queryKeys.media(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			toast.success(m.logo_updated());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(`${base}/logo`);
		},
		onSuccess: async () => {
			await refreshUser();
			// The clear appended an audit entry — refresh the trail.
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			toast.success(m.logo_removed());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return {
		upload: upload.mutate,
		clear: clear.mutate,
		isUploading: upload.isPending,
		isClearing: clear.isPending,
	};
};
