import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldTypeCode } from "#/metafields";
import * as m from "#/paraglide/messages";

export const useMetaobjectDefinitionActions = (
	tourOperatorId: string,
	definitionId: string,
) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const base = `/tour-operators/${tourOperatorId}/metaobject-definitions/${definitionId}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.metaobjectDefinition(tourOperatorId, definitionId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.metaobjectDefinitions(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const remove = useMutation<unknown, AxiosError>({
		mutationFn: () => authApi.delete(base),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjectDefinitions(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjects(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
		onError: () => toast.error(m.error()),
	});

	const addField = useMutation<
		unknown,
		AxiosError,
		{ key: string; type: MetafieldTypeCode; name: string }
	>({
		mutationFn: (field) => authApi.post(`${base}/fields`, field),
		onSuccess: () => {
			toast.success(m.metaobject_field_added());
			invalidate();
		},
	});

	const renameField = useMutation<
		unknown,
		AxiosError,
		{ key: string; name: string }
	>({
		mutationFn: ({ key, name }) =>
			authApi.patch(`${base}/fields/${key}`, { name }),
		onSuccess: () => {
			toast.success(m.metaobject_field_renamed());
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const removeField = useMutation<unknown, AxiosError, { key: string }>({
		mutationFn: ({ key }) => authApi.delete(`${base}/fields/${key}`),
		onSuccess: () => {
			toast.success(m.metaobject_field_removed());
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjects(tourOperatorId),
			});
			invalidate();
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { remove, addField, renameField, removeField };
};
