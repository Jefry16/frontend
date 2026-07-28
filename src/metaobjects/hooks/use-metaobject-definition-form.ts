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
	type DefinitionFormData,
	definitionSchema,
} from "../validators/metaobject";

// Create (no `definition`, POSTs type + name + description + the initial
// fields the component collects) or edit (with one — PUTs name/description
// only; the type is immutable and the field set is managed on the detail).
// On success navigates to the detail (create-navigates-to-detail rule).
// A 409 is a duplicate type.
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
		DefinitionFormData & { fields: MetaobjectField[] }
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
			// Create/update appended an audit entry — refresh the trail.
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

	const form = useForm({
		defaultValues: {
			type: definition?.type ?? "",
			name: definition?.name ?? "",
			description: definition?.description ?? "",
		} as DefinitionFormData,
		validators: { onSubmit: definitionSchema },
	});

	return { form, mutate, isPending, errorMessage, isEdit: !!definition };
};
