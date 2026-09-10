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
import type { Category } from "../types";
import {
	type CategoryFields,
	type CategoryFormData,
	categorySchema,
} from "../validators/category";

export const useCategoryForm = (
	tourOperatorId: string,
	category?: Category,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const conflictMessage = () =>
		category ? m.category_name_taken() : m.category_name_taken_create();

	const { mutate, isPending } = useMutation<string, AxiosError, CategoryFields>(
		{
			mutationFn: async (fields) => {
				const base = `/tour-operators/${tourOperatorId}/categories`;
				if (category) {
					await authApi.patch(`${base}/${category.id}`, fields);
					return category.id;
				}
				const { headers } = await authApi.post(base, fields);
				const id = (headers.location ?? "").split("/").pop();
				if (!id) throw new Error("Missing Location header on create response");
				return id;
			},
			onSuccess: (categoryId) => {
				setErrorMessage(null);
				if (category) {
					toast.updated(m.category());
					queryClient.invalidateQueries({
						queryKey: queryKeys.category(tourOperatorId, categoryId),
					});
				} else {
					toast.created(m.category());
				}
				queryClient.invalidateQueries({
					queryKey: queryKeys.categories(tourOperatorId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
				navigate({
					to: "/tour-operators/$tourOperatorId/categories/$categoryId",
					params: { tourOperatorId, categoryId },
				});
			},
			onError: (error) =>
				setErrorMessage(
					error.response?.status === 409
						? conflictMessage()
						: apiErrorMessage(error),
				),
		},
	);

	const form = useForm({
		defaultValues: { name: category?.name ?? "" } as CategoryFormData,
		validators: { onSubmit: categorySchema },
		onSubmit: ({ value }) => mutate(categorySchema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!category };
};
