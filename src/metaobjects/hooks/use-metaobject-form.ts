import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { z } from "zod";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Metaobject, MetaobjectDefinition } from "../types";
import { entrySchema } from "../validators/metaobject";

const entryFormSchema = entrySchema.extend({
	values: z.record(z.string(), z.string()),
});

interface EntryFormValues {
	handle: string;
	name: string;
	values: Record<string, string>;
}

export const useMetaobjectForm = (
	tourOperatorId: string,
	definition: MetaobjectDefinition,
	entry?: Metaobject,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		EntryFormValues
	>({
		mutationFn: async (fields) => {
			const base = `/tour-operators/${tourOperatorId}/metaobjects`;
			const values: Record<string, string | null> = {};
			for (const field of definition.fields) {
				const raw = fields.values[field.key] ?? "";
				values[field.key] = raw.trim() === "" ? null : raw;
			}
			if (entry) {
				await authApi.patch(`${base}/${entry.id}`, {
					name: fields.name,
					handle: fields.handle,
					values,
				});
				return entry.id;
			}
			const { headers } = await authApi.post(base, {
				definitionId: definition.id,
				handle: fields.handle,
				name: fields.name,
				values,
			});
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (metaobjectId) => {
			setErrorMessage(null);
			if (entry) {
				toast.updated(m.metaobject());
				queryClient.invalidateQueries({
					queryKey: queryKeys.metaobject(tourOperatorId, metaobjectId),
				});
			} else {
				toast.created(m.metaobject());
			}
			queryClient.invalidateQueries({
				queryKey: queryKeys.metaobjects(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId",
				params: { tourOperatorId, metaobjectId },
			});
		},
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.metaobject_handle_taken()
					: apiErrorMessage(error),
			),
	});

	const form = useForm({
		defaultValues: {
			handle: entry?.handle ?? "",
			name: entry?.name ?? "",
			values: Object.fromEntries(
				definition.fields.map((f) => [
					f.key,
					entry?.fields.find((v) => v.key === f.key)?.value ?? "",
				]),
			),
		} as EntryFormValues,
		validators: { onSubmit: entryFormSchema },
		onSubmit: ({ value }) => mutate(value),
	});

	return { form, isPending, errorMessage, isEdit: !!entry };
};
