import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

const MEDIA_ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
]);
export const MEDIA_ACCEPT = [...MEDIA_ALLOWED_TYPES].join(",");
const MEDIA_MAX_BYTES = 25 * 1024 * 1024;

export const useMediaUpload = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const mutation = useMutation<{ ok: number; failed: number }, never, File[]>({
		mutationFn: async (files) => {
			const results = await Promise.allSettled(
				files.map((file) => {
					const fd = new FormData();
					fd.append("file", file);
					return authApi.post(`/tour-operators/${tourOperatorId}/media`, fd);
				}),
			);
			return {
				ok: results.filter((r) => r.status === "fulfilled").length,
				failed: results.filter((r) => r.status === "rejected").length,
			};
		},
		onSuccess: ({ ok, failed }) => {
			if (ok > 0) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.media(tourOperatorId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
				toast.success(m.media_uploaded());
			}
			if (failed > 0) toast.error(m.media_upload_failed());
		},
	});

	const upload = (files: File[]) => {
		const valid: File[] = [];
		const rejected: string[] = [];
		for (const file of files) {
			if (!MEDIA_ALLOWED_TYPES.has(file.type) || file.size > MEDIA_MAX_BYTES) {
				rejected.push(file.name);
			} else {
				valid.push(file);
			}
		}
		if (rejected.length > 0) {
			toast.error(m.media_rejected({ names: rejected.join(", ") }));
		}
		if (valid.length > 0) mutation.mutate(valid);
	};

	return { upload, isPending: mutation.isPending };
};
