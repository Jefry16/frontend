import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// Delete (ADMIN+) — CASCADES every stored value for the definition, which is
// why the caller's confirm dialog carries the warning. Success copy +
// navigation are left to the caller.
export const useMetafieldDefinitionActions = (
	tourOperatorId: string,
	definitionId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () =>
			authApi.delete(
				`/tour-operators/${tourOperatorId}/metafield-definitions/${definitionId}`,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.metafieldDefinitions(tourOperatorId),
			});
			// Cascaded values are gone too — drop every owner's cached editor.
			queryClient.invalidateQueries({ queryKey: ["metafield-values"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	return { remove };
};
