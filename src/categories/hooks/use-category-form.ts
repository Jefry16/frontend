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

// Create (no `category`) or edit (with one). On success navigates to the detail
// page (create-navigates-to-detail rule).
//
// The 409 wording follows the mode, not the message. Create can conflict two
// ways — the name is taken, or another category claimed the same derived handle
// first — and edit can only conflict the first way, because the handle is never
// regenerated. The mode is state we own, so this stays clear of the rule against
// branching on `message`, which is prose and changes.
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
				// The create answers 201 with an empty body, so the Location header is
				// the only place the new id exists.
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
