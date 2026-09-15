import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { type MenuFormData, menuSchema } from "../validators/menu";

export const useMenuForm = (tourOperatorId: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<string, AxiosError, MenuFormData>({
		mutationFn: async (payload) => {
			const { headers } = await authApi.post(
				`/tour-operators/${tourOperatorId}/menus`,
				{ handle: payload.handle, title: payload.title },
			);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (menuId) => {
			setErrorMessage(null);
			toast.created(m.menu());
			queryClient.invalidateQueries({
				queryKey: queryKeys.menus(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
				params: { tourOperatorId, menuId },
			});
		},
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.menu_handle_taken()
					: apiErrorMessage(error),
			),
	});

	const form = useForm({
		defaultValues: { handle: "", title: "" } as MenuFormData,
		validators: { onSubmit: menuSchema },
		onSubmit: ({ value }) => mutate(value),
	});

	return { form, isPending, errorMessage };
};
