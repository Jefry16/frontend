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
import type { MetaobjectDefinition, MetaobjectField } from "../types";
import {
	type DefinitionCreateFormData,
	definitionCreateSchema,
	definitionEditSchema,
} from "../validators/metaobject";

// Edit PUTs name and description only: the type is immutable, and the field set
// is managed on the detail page. A 409 is a duplicate type.
export const useMetaobjectDefinitionForm = (
	tourOperatorId: string,
	definition?: MetaobjectDefinition,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		DefinitionCreateFormData & { fields: MetaobjectField[] }
	>({
		mutationFn: async (payload) => {
			const base = `/tour-operators/${tourOperatorId}/metaobject-definitions`;
			const description = payload.description.trim() || null;
			if (definition) {
				await authApi.put(`${base}/${definition.id}`, {
					name: payload.name,
					description,
				});
				return definition.id;
			}
			const { headers } = await authApi.post(base, {
				type: payload.type,
				name: payload.name,
				description,
				fields: payload.fields,
			});
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (definitionId) => {
			setErrorMessage(null);
			if (definition) {
				toast.updated(m.metaobject_definition());
				queryClient.invalidateQueries({
					queryKey: queryKeys.metaobjectDefinition(
						tourOperatorId,
						definitionId,
					),
				});
			} else {
				toast.created(m.metaobject_definition());
			}
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjectDefinitions(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId",
				params: { tourOperatorId, definitionId },
			});
		},
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.metaobject_type_taken()
					: apiErrorMessage(error),
			),
	});

	// The schema differs by mode: only create defines the initial field set, so
	// `fields` rides along empty on an edit.
	const isEdit = !!definition;
	const form = useForm({
		defaultValues: {
			type: definition?.type ?? "",
			name: definition?.name ?? "",
			description: definition?.description ?? "",
			fields: isEdit ? [] : [{ key: "", type: "single_line_text", name: "" }],
		} as DefinitionCreateFormData,
		validators: {
			onSubmit: isEdit ? definitionEditSchema : definitionCreateSchema,
		},
		onSubmit: ({ value }) =>
			mutate({ ...value, fields: value.fields as MetaobjectField[] }),
	});

	return { form, isPending, errorMessage, isEdit };
};
