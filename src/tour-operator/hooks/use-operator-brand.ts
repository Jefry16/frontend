import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Brand, BrandImageSlot } from "../types";
import { type BrandTextFormData, brandTextSchema } from "../validators/brand";

/** The shop's brand row — images, slogan, palette, social links. */
export const useBrand = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.brand(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<Brand>(
				`/tour-operators/${tourOperatorId}/brand`,
			);
			return data;
		},
	});

/**
 * Resolve one media id to its asset, for a slot's preview. A local fetch rather
 * than `#/media`'s `useMediaByIds`: `media` imports `#/tour-operator`, so
 * importing it back through the barrel is a cycle. Same reason the SEO card
 * resolves its og:image by hand.
 */
export const useBrandImage = (tourOperatorId: string, mediaId: string | null) =>
	useQuery({
		queryKey: queryKeys.mediaAsset(tourOperatorId, mediaId ?? ""),
		enabled: !!mediaId,
		queryFn: async () => {
			const { data } = await authApi.get<{ id: string; url: string }>(
				`/tour-operators/${tourOperatorId}/media/${mediaId}`,
			);
			return data;
		},
	});

/**
 * The brand writes. Every one sends the WHOLE row: `PUT /brand` is a full
 * replace (`UpdateBrandUseCase` rebuilds from the body, and `readColors`
 * returns an empty list for an absent `colors`), so a patch-shaped body would
 * wipe the palette and the social links this release does not yet edit. The
 * caller passes the brand it read; these helpers change one part of it.
 *
 * Setting an image is the same two-step the logo used to be: upload to the
 * media library (multipart → 201 + Location), then point the slot at that id.
 * If the upload lands and the PUT fails, the asset stays unreferenced — the
 * contract has no client media-delete, so a retry re-uploads rather than
 * compensating.
 */
export const useBrandActions = (tourOperatorId: string, brand?: Brand) => {
	const { refreshUser } = useAuth();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const base = `/tour-operators/${tourOperatorId}`;

	const put = async (next: Brand) => {
		await authApi.put(`${base}/brand`, next);
	};

	const settled = async () => {
		// The sidebar switcher reads logoUrl off the auth profile, not off brand.
		await refreshUser();
		queryClient.invalidateQueries({
			queryKey: queryKeys.brand(tourOperatorId),
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
			if (!brand) throw new Error("Brand not loaded");
			const fd = new FormData();
			fd.append("file", file);
			// Let axios set the multipart boundary from the FormData — never
			// hand-set Content-Type. 201 + Location: .../media/{mediaId}.
			const { headers } = await authApi.post(`${base}/media`, fd);
			const mediaId = (headers.location ?? "").split("/").pop();
			if (!mediaId) throw new Error("Missing Location header on media upload");
			await put({ ...brand, [slot]: mediaId });
		},
		onSuccess: async () => {
			await settled();
			toast.success(m.brand_image_updated());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	const clearImage = useMutation<void, AxiosError, BrandImageSlot>({
		mutationFn: async (slot) => {
			if (!brand) throw new Error("Brand not loaded");
			await put({ ...brand, [slot]: null });
		},
		onSuccess: async () => {
			await settled();
			toast.success(m.brand_image_removed());
		},
		onError: (error) => toast.error(apiErrorMessage(error)),
	});

	return { setImage, clearImage };
};

/**
 * The slogan + short-description form (§5). Split from `useBrandActions`
 * because the images are not form fields — they upload on drop — while these
 * two submit together.
 *
 * The mutation still spreads over the loaded brand: `PUT /brand` is a full
 * replace, so the images, palette and social links have to ride along.
 */
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
		mutationFn: async (text) => {
			await authApi.put(`/tour-operators/${tourOperatorId}/brand`, {
				...brand,
				// Blank collapses to null so the storefront falls back rather than
				// rendering an empty line.
				slogan: text.slogan || null,
				shortDescription: text.shortDescription || null,
			});
		},
		onSuccess: async () => {
			setErrorMessage(null);
			await refreshUser();
			queryClient.invalidateQueries({
				queryKey: queryKeys.brand(tourOperatorId),
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
