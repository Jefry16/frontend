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
import type { MetafieldDefinition } from "../types";
import {
	type DefinitionFields,
	type DefinitionFormData,
	definitionSchema,
} from "../validators/definition";

// Create (no `definition`) or edit (with one). ownerType/namespace/key/type
// are immutable — the edit PUT carries only name/description. On success
// navigates to the detail page (create-navigates-to-detail rule). A 409 is a
// duplicate namespace.key for that owner type.
export const useMetafieldDefinitionForm = (
	tourOperatorId: string,
	definition?: MetafieldDefinition,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		DefinitionFields
	>({
		mutationFn: async (fields) => {
			const base = `/tour-operators/${tourOperatorId}/metafield-definitions`;
			const description = fields.description || null;
			if (definition) {
				await authApi.put(`${base}/${definition.id}`, {
					name: fields.name,
					description,
				});
				return definition.id;
			}
			// 201 Created with a Location header, no body — parse the new id out.
			const { headers } = await authApi.post(base, {
				ownerType: fields.ownerType,
				namespace: fields.namespace,
				key: fields.key,
				type: fields.type,
				metaobjectDefinitionId:
					fields.type === "metaobject_reference"
						? fields.metaobjectDefinitionId
						: null,
				name: fields.name,
				description,
			});
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (definitionId) => {
			setErrorMessage(null);
			if (definition) {
				toast.updated(m.metafield_definition());
				queryClient.invalidateQueries({
					queryKey: queryKeys.metafieldDefinition(tourOperatorId, definitionId),
				});
			} else {
				toast.created(m.metafield_definition());
			}
			queryClient.invalidateQueries({
				queryKey: queryKeys.metafieldDefinitions(tourOperatorId),
			});
			// Create/update appended an audit entry — refresh the trail.
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/content/metafields/$definitionId",
				params: { tourOperatorId, definitionId },
			});
		},
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.metafield_identifier_taken()
					: apiErrorMessage(error),
			),
	});

	const form = useForm({
		defaultValues: {
			ownerType: definition?.ownerType ?? "experience",
			namespace: definition?.namespace ?? "custom",
			key: definition?.key ?? "",
			type: definition?.type ?? "single_line_text",
			metaobjectDefinitionId: definition?.metaobjectDefinitionId ?? "",
			name: definition?.name ?? "",
			description: definition?.description ?? "",
		} as DefinitionFormData,
		validators: { onSubmit: definitionSchema },
		onSubmit: ({ value }) => mutate(definitionSchema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!definition };
};
