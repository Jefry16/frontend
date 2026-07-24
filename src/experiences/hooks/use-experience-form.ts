import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import {
	type ExperienceFormData,
	type ExperiencePayload,
	experienceSchema,
} from "../validators/experience";

// Create-only for now. Edit (PATCH) is blocked until the experience GET exposes
// media ids — the response resolves them to URLs, so a PATCH (which treats null
// media as empty) would wipe an experience's media. Media selection itself also
// needs a media picker that doesn't exist yet.
export const useExperienceForm = (tourOperatorId: string) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		ExperiencePayload
	>({
		mutationFn: async (payload) => {
			// 201 Created with a Location header, no body — parse the new id out.
			const { headers } = await authApi.post(
				`/tour-operators/${tourOperatorId}/experiences`,
				payload,
			);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (experienceId) => {
			setErrorMessage(null);
			toast.created(m.experience());
			navigate({
				to: "/tour-operators/$tourOperatorId/experiences/$experienceId",
				params: { tourOperatorId, experienceId },
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			longDescription: "",
			durationMinutes: "",
			bookingCutoffHours: "24",
			featured: false,
		} as ExperienceFormData,
		validators: { onSubmit: experienceSchema },
		onSubmit: ({ value }) => mutate(experienceSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
