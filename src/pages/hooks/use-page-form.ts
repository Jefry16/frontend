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

// Create (no `page`) or edit (with one). Create sends the operator-chosen
// handle (409 = taken); edit sends the content + template suffix (the handle
// changes only through the rename action). On success navigates to the detail
// (create-navigates-to-detail rule).
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
				// Explicit per-mode payloads: edit never sends the handle (renames
				// are a separate action), create never sends the template suffix
				// (backend parity).
				if (page) {
					await authApi.patch(`${base}/${page.id}`, {
						title: fields.title,
						body: fields.body,
						seoTitle: fields.seoTitle,
						seoDescription: fields.seoDescription,
						templateSuffix: fields.templateSuffix,
					});
					return page.id;
				}
				// 201 Created with a Location header, no body — parse the new id out.
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
				// The mutation appended an audit entry — refresh the trail.
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
		// All fields present in both modes (zod strips what each schema doesn't
		// declare): create ignores templateSuffix, edit ignores handle.
		defaultValues: {
			title: page?.title ?? "",
			handle: page?.handle ?? "",
			body: page?.body ?? "",
			seoTitle: page?.seoTitle ?? "",
			seoDescription: page?.seoDescription ?? "",
			templateSuffix: page?.templateSuffix ?? "",
		} as PageFormData,
		validators: { onSubmit: schema },
		onSubmit: ({ value }) => mutate(schema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!page };
};
