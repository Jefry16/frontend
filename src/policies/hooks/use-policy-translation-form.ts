import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { PolicyTranslation } from "../types";
import {
	type PolicyTranslationFormData,
	type PolicyTranslationPayload,
	policyTranslationSchema,
} from "../validators/policy-translation";

// One locale's overlay: PUT upserts, DELETE clears it (both fields fall back to
// the canonical policy). Both refresh the switcher dots and the audit trail.
//
// The PUT is a full replace, so the form always posts both fields — seeding
// defaultValues from the fetched overlay is what keeps an untouched one intact.
export const usePolicyTranslationForm = ({
	tourOperatorId,
	policyId,
	locale,
	translation,
}: {
	tourOperatorId: string;
	policyId: string;
	locale: string;
	translation: PolicyTranslation;
}) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const endpoint = `/tour-operators/${tourOperatorId}/policies/${policyId}/translations/${locale}`;

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.policyTranslations(tourOperatorId, policyId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const save = useMutation<void, AxiosError, PolicyTranslationPayload>({
		mutationFn: async (data) => {
			await authApi.put(endpoint, data);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.success(m.translation_saved());
			invalidate();
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const clear = useMutation<void, AxiosError, void>({
		mutationFn: async () => {
			await authApi.delete(endpoint);
		},
		onSuccess: () => {
			setErrorMessage(null);
			toast.deleted(m.translation());
			invalidate();
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			title: translation.title ?? "",
			body: translation.body ?? "",
		} as PolicyTranslationFormData,
		validators: { onSubmit: policyTranslationSchema },
		onSubmit: ({ value }) => save.mutate(policyTranslationSchema.parse(value)),
	});

	return {
		form,
		errorMessage,
		isPending: save.isPending,
		clear: clear.mutate,
		isClearing: clear.isPending,
	};
};
