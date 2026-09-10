import { useForm } from "@tanstack/react-form";
import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Brand, BrandImageSlot } from "../types";
import {
	type BrandColorsFormData,
	type BrandSocialLinksFormData,
	type BrandTextFormData,
	brandColorsSchema,
	brandSocialLinksSchema,
	brandTextSchema,
} from "../validators/brand";
import { operatorDetailQuery } from "./use-operator-details";

export const useBrand = (tourOperatorId: string) =>
	useQuery({
		...operatorDetailQuery(tourOperatorId),
		select: (operator) => operator.brand,
	});

const patchBrandSection = async (
	queryClient: QueryClient,
	tourOperatorId: string,
	change: Partial<Brand>,
) => {
	const fresh = await queryClient.fetchQuery({
		...operatorDetailQuery(tourOperatorId),
		staleTime: 0,
	});
	// A section present in this PATCH is REPLACED WHOLE, and `fresh` is the whole
	// operator. Spreading it here rather than its brand would carry seo, locales
	// and storefrontPassword along and wipe all three, with a 204 in reply.
	await authApi.patch(`/tour-operators/${tourOperatorId}`, {
		brand: { ...fresh.brand, ...change },
	});
};

export const useBrandActions = (tourOperatorId: string) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const base = `/tour-operators/${tourOperatorId}`;

	const settled = async () => {
		await refreshUser();
		queryClient.invalidateQueries({
			queryKey: queryKeys.operatorDetails(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.media(tourOperatorId),
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.activity(tourOperatorId),
		});
	};

	const setImage = useMutation<
		void,
		AxiosError,
		{ slot: BrandImageSlot; file: File }
	>({
		mutationFn: async ({ slot, file }) => {
			const fd = new FormData();
			fd.append("file", file);
			const { headers } = await authApi.post(`${base}/media`, fd);
			const mediaId = (headers.location ?? "").split("/").pop();
			if (!mediaId) throw new Error("Missing Location header on media upload");
			await patchBrandSection(queryClient, tourOperatorId, { [slot]: mediaId });
		},
		onSuccess: async () => {
			await settled();
			toast.success(m.brand_image_updated());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const clearImage = useMutation<void, AxiosError, BrandImageSlot>({
		mutationFn: async (slot) =>
			patchBrandSection(queryClient, tourOperatorId, { [slot]: null }),
		onSuccess: async () => {
			await settled();
			toast.success(m.brand_image_removed());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { setImage, clearImage };
};

export const useBrandTextForm = (tourOperatorId: string, brand: Brand) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		BrandTextFormData
	>({
		mutationFn: async (text) =>
			patchBrandSection(queryClient, tourOperatorId, {
				slogan: text.slogan || null,
				shortDescription: text.shortDescription || null,
			}),
		onSuccess: async () => {
			setErrorMessage(null);
			await refreshUser();
			queryClient.invalidateQueries({
				queryKey: queryKeys.operatorDetails(tourOperatorId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
			});
			toast.success(m.brand_saved());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			slogan: brand.slogan ?? "",
			shortDescription: brand.shortDescription ?? "",
		} as BrandTextFormData,
		validators: { onSubmit: brandTextSchema },
		onSubmit: ({ value }) => mutate(brandTextSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};

export const useBrandColorsForm = (tourOperatorId: string, brand: Brand) => {
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		BrandColorsFormData
	>({
		mutationFn: async (colors) =>
			patchBrandSection(queryClient, tourOperatorId, { colors }),
		onSuccess: async () => {
			setErrorMessage(null);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.operatorDetails(tourOperatorId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				}),
			]);
			toast.success(m.brand_colors_saved());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			primary: brand.colors.primary.map((c) => ({ ...c })),
			secondary: brand.colors.secondary.map((c) => ({ ...c })),
		} as BrandColorsFormData,
		validators: { onSubmit: brandColorsSchema },
		onSubmit: ({ value }) => mutate(brandColorsSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};

export const useBrandSocialLinksForm = (
	tourOperatorId: string,
	brand: Brand,
) => {
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		void,
		AxiosError,
		BrandSocialLinksFormData
	>({
		mutationFn: async ({ socialLinks }) =>
			patchBrandSection(queryClient, tourOperatorId, { socialLinks }),
		onSuccess: async () => {
			setErrorMessage(null);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: queryKeys.operatorDetails(tourOperatorId),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.activity(tourOperatorId),
				}),
			]);
			toast.success(m.brand_social_links_saved());
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			socialLinks: brand.socialLinks.map((l) => ({ ...l })),
		} as BrandSocialLinksFormData,
		validators: { onSubmit: brandSocialLinksSchema },
		onSubmit: ({ value }) => mutate(brandSocialLinksSchema.parse(value)),
	});

	return { form, isPending, errorMessage };
};
