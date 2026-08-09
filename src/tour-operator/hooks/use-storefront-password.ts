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

// Storefront password protection (Shopify's Store access): the shared gate
// the operator hands out — member-visible by design, including the password.
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

// The save (ADMIN+): a full replace, except a null/blank password keeps the
// stored one (so toggling or editing the message never re-sends it). Error
// display is the caller's (inline alert, not a toast).
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

/**
 * The store-access form (§5). The schema owns the "enabled needs a password"
 * rule, so the component no longer hand-checks it before submitting.
 */
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
					// Blank clears — the gate keeps no stale password once it is off.
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
