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

// Plain property access, so the cached object's own reference comes back and
// the three brand forms keep stable defaults across renders.
export const useBrand = (tourOperatorId: string) =>
	useQuery({
		...operatorDetailQuery(tourOperatorId),
		select: (operator) => operator.brand,
	});

/**
 * Merge a change into the CURRENT brand and send the whole section.
 *
 * A `brand` present in the PATCH is a full replace, so every section has to send
 * the parts it does not edit. Merging over the render-time copy is what four independently-saving
 * sections cannot do: one section saves, and until its refetch lands the others
 * still hold the old value — their next save silently reverts it, with a 200 and
 * a screen that looks right. So the freshest brand is fetched at save time.
 *
 * This closes the gap between one section's write and the refetch. It does NOT
 * make the write atomic: two tabs saving the same instant still race, and that
 * needs optimistic locking the API does not offer.
 *
 * `staleTime: 0` is passed rather than inherited: `fetchQuery` honours whatever
 * the client's default is, and under a long one it would hand back the very
 * cached copy this exists to get past. The guarantee has to belong to the call.
 */
const patchBrandSection = async (
	queryClient: QueryClient,
	tourOperatorId: string,
	change: Partial<Brand>,
) => {
	const fresh = await queryClient.fetchQuery({
		...operatorDetailQuery(tourOperatorId),
		staleTime: 0,
	});
	// ONE key, `brand`. `fresh` is now the whole operator, so spreading it here
	// instead of its brand would put seo, locales and storefrontPassword into a
	// request that replaces every section it is given — a 204, a screen that
	// still looks right, and the rest of the operator's settings gone.
	await authApi.patch(`/tour-operators/${tourOperatorId}`, {
		brand: { ...fresh.brand, ...change },
	});
};

/**
 * If an image upload lands and the PUT then fails, the asset stays unreferenced
 * — there is no client media-delete to compensate with.
 */
export const useBrandActions = (tourOperatorId: string) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const base = `/tour-operators/${tourOperatorId}`;

	const settled = async () => {
		// The sidebar switcher reads logoUrl off the auth profile, not off brand.
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
			// No Content-Type header: axios derives the multipart boundary itself.
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

// Separate from useBrandActions because the images are not form fields — they
// upload on drop, while these two submit together.
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
				// Blank collapses to null so the storefront falls back rather than
				// rendering an empty line.
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

/**
 * The palette. Position in each array IS the order the storefront paints in, so
 * the rows submit exactly as they read — no sorting on either side.
 */
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

/**
 * The social links. One row per platform — the card filters taken platforms out
 * of each row's options, and the schema catches what that cannot (a row whose
 * platform was picked before an earlier row changed to match it). Either way the
 * backend answers a 422 naming the platform, which `apiErrorMessage` surfaces.
 */
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
