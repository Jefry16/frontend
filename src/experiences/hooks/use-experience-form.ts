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
import type { Experience } from "../types";
import {
	type ExperienceFields,
	type ExperienceFormData,
	experienceSchema,
} from "../validators/experience";

export const useExperienceForm = (
	tourOperatorId: string,
	experience?: Experience,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		ExperienceFields
	>({
		mutationFn: async (fields) => {
			// Every field comes from the form, so the parsed value IS the payload.
			const payload = fields;
			const base = `/tour-operators/${tourOperatorId}/experiences`;
			if (experience) {
				await authApi.patch(`${base}/${experience.id}`, payload);
				return experience.id;
			}
			const { headers } = await authApi.post(base, payload);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (experienceId) => {
			setErrorMessage(null);
			if (experience) {
				toast.updated(m.experience());
				queryClient.invalidateQueries({
					queryKey: queryKeys.experience(tourOperatorId, experienceId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.experiences(tourOperatorId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				});
			} else {
				toast.created(m.experience());
			}
			navigate({
				to: "/tour-operators/$tourOperatorId/experiences/$experienceId",
				params: { tourOperatorId, experienceId },
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			name: experience?.name ?? "",
			description: experience?.description ?? "",
			longDescription: experience?.longDescription ?? "",
			bookingCutoffHours: experience
				? String(experience.bookingCutoffHours)
				: "24",
			startingPrice: experience ? String(experience.startingPrice) : "",
			featured: experience?.featured ?? false,
			thumbnailMediaId: experience?.thumbnailMediaId ?? null,
			mediaIds: experience?.mediaIds ?? [],
			seoTitle: experience?.seoTitle ?? "",
			seoDescription: experience?.seoDescription ?? "",
		} as ExperienceFormData,
		validators: { onSubmit: experienceSchema },
		onSubmit: ({ value }) => mutate(experienceSchema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!experience };
};
