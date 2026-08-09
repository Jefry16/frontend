import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import {
	type StorefrontPasswordFormData,
	storefrontPasswordSchema,
} from "../validators/storefront-password";

// Member-visible by design, password included: it is a shared gate the operator
// hands out, not a credential.
export interface StorefrontPasswordSettings {
	enabled: boolean;
	password: string | null;
	message: string | null;
}

export const useStorefrontPassword = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.storefrontPassword(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<StorefrontPasswordSettings>(
				`/tour-operators/${tourOperatorId}/storefront-password`,
			);
			return data;
		},
	});

// A full replace, except that a blank password keeps the stored one — which is
// what lets the toggle and the message save without re-sending it.
const useStorefrontPasswordSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<
		unknown,
		AxiosError,
		{ enabled: boolean; password: string | null; message: string | null }
	>({
		mutationFn: (payload) =>
			authApi.put(
				`/tour-operators/${tourOperatorId}/storefront-password`,
				payload,
			),
		onSuccess: () => {
			toast.updated(m.store_access());
			queryClient.invalidateQueries({
				queryKey: queryKeys.storefrontPassword(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
		},
	});
};

// The schema owns the "enabled needs a password" rule.
export const useStorefrontPasswordForm = (
	tourOperatorId: string,
	settings: StorefrontPasswordSettings,
) => {
	const save = useStorefrontPasswordSave(tourOperatorId);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			enabled: settings.enabled,
			password: settings.password ?? "",
			message: settings.message ?? "",
		} as StorefrontPasswordFormData,
		validators: { onSubmit: storefrontPasswordSchema },
		onSubmit: ({ value }) => {
			const v = storefrontPasswordSchema.parse(value);
			save.mutate(
				{
					enabled: v.enabled,
					// The gate keeps no stale password once it is off.
					password: v.password || null,
					message: v.message || null,
				},
				{
					onSuccess: () => setErrorMessage(null),
					onError: (error) => setErrorMessage(apiErrorMessage(error)),
				},
			);
		},
	});

	return { form, isPending: save.isPending, errorMessage };
};
