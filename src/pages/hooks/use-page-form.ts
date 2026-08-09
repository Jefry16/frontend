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
import type { Page } from "../types";
import {
	type PageFormData,
	type PageFormFields,
	pageFormSchema,
} from "../validators/page";

// On create a 409 means the handle is taken. An edit never sends the handle:
// renaming is a separate action.
export const usePageForm = (tourOperatorId: string, page?: Page) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const schema = pageFormSchema(!!page);

	const { mutate, isPending } = useMutation<string, AxiosError, PageFormFields>(
		{
			mutationFn: async (fields) => {
				const base = `/tour-operators/${tourOperatorId}/pages`;
				if (page) {
					await authApi.patch(`${base}/${page.id}`, {
						title: fields.title,
						body: fields.body,
						seoTitle: fields.seoTitle,
						seoDescription: fields.seoDescription,
					});
					return page.id;
				}
				// 201 with a Location header and no body.
				const { headers } = await authApi.post(base, {
					title: fields.title,
					handle: fields.handle,
					body: fields.body,
					seoTitle: fields.seoTitle,
					seoDescription: fields.seoDescription,
				});
				const id = (headers.location ?? "").split("/").pop();
				if (!id) throw new Error("Missing Location header on create response");
				return id;
			},
			onSuccess: (pageId) => {
				setErrorMessage(null);
				if (page) {
					toast.updated(m.page());
					queryClient.invalidateQueries({
						queryKey: queryKeys.pageDetail(tourOperatorId, pageId),
					});
				} else {
					toast.created(m.page());
				}
				queryClient.invalidateQueries({
					queryKey: queryKeys.pages(tourOperatorId),
				});
				// The mutation appended an audit entry.
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
				navigate({
					to: "/tour-operators/$tourOperatorId/content/pages/$pageId",
					params: { tourOperatorId, pageId },
				});
			},
			onError: (error) =>
				setErrorMessage(
					error.response?.status === 409
						? m.page_handle_taken()
						: apiErrorMessage(error),
				),
		},
	);

	const form = useForm({
		// Both modes seed every field; zod strips what each schema omits.
		defaultValues: {
			title: page?.title ?? "",
			handle: page?.handle ?? "",
			body: page?.body ?? "",
			seoTitle: page?.seoTitle ?? "",
			seoDescription: page?.seoDescription ?? "",
		} as PageFormData,
		validators: { onSubmit: schema },
		onSubmit: ({ value }) => mutate(schema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!page };
};
