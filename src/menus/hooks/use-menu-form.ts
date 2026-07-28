import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { type MenuFormData, menuSchema } from "../validators/menu";

// Create-only (menus have no edit form: the handle is immutable and the title
// changes via the rename dialog). POSTs handle + title, navigates to the new
// menu's detail (create-navigates-to-detail rule). A 409 is a taken handle.
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
	});

	return { form, mutate, isPending, errorMessage };
};
