import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { StorefrontPasswordSettings } from "../types";
import {
	type StorefrontPasswordFormData,
	storefrontPasswordSchema,
} from "../validators/storefront-password";
import { operatorDetailQuery } from "./use-operator-details";

export const useStorefrontPassword = (tourOperatorId: string) =>
	useQuery({
		...operatorDetailQuery(tourOperatorId),
		select: (operator) => operator.storefrontPassword,
	});

/**
 * A section of the operator's PATCH, and one key only — its siblings came back
 * on the same read and each would be replaced if sent.
 *
 * `enabled` is required: omit it and the write is a 422, which is what stops the
 * storefront being opened by an accidentally empty body. A blank password KEEPS
 * the stored one rather than clearing it, which is what lets the toggle and the
 * message save on their own. A blank message does clear.
 */
const useStorefrontPasswordSave = (tourOperatorId: string) => {
	const queryClient = useQueryClient();
	const toast = useAppToast();

	return useMutation<
		unknown,
		AxiosError,
		{ enabled: boolean; password: string | null; message: string | null }
	>({
		mutationFn: (storefrontPassword) =>
			authApi.patch(`/tour-operators/${tourOperatorId}`, {
				storefrontPassword,
			}),
		onSuccess: () => {
			toast.updated(m.store_access());
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
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
					// Blank KEEPS the stored password — it does not clear it. So the
					// gate can be changed but never emptied, and turning it back on
					// without retyping works on purpose.
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

export type { StorefrontPasswordSettings };
