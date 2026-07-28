import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

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
export const useStorefrontPasswordSave = (tourOperatorId: string) => {
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
