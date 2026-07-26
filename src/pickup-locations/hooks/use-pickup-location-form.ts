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
import { formatTime } from "../format";
import type { PickupLocation } from "../types";
import {
	type PickupLocationFields,
	type PickupLocationFormData,
	pickupLocationSchema,
} from "../validators/pickup-location";

// Create (no `pickup`) or edit (with one). On success navigates to the detail
// page (create-navigates-to-detail rule). A 409 is specifically a duplicate
// name (unique per operator, case-insensitive).
export const usePickupLocationForm = (
	tourOperatorId: string,
	pickup?: PickupLocation,
) => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		PickupLocationFields
	>({
		mutationFn: async (fields) => {
			const base = `/tour-operators/${tourOperatorId}/pickup-locations`;
			if (pickup) {
				await authApi.patch(`${base}/${pickup.id}`, fields);
				return pickup.id;
			}
			// 201 Created with a Location header, no body — parse the new id out.
			const { headers } = await authApi.post(base, fields);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: (pickupLocationId) => {
			setErrorMessage(null);
			if (pickup) {
				toast.updated(m.pickup_location());
				queryClient.invalidateQueries({
					queryKey: queryKeys.pickupLocation(tourOperatorId, pickupLocationId),
				});
			} else {
				toast.created(m.pickup_location());
			}
			queryClient.invalidateQueries({
				queryKey: queryKeys.pickupLocations(tourOperatorId),
			});
			navigate({
				to: "/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId",
				params: { tourOperatorId, pickupLocationId },
			});
		},
		onError: (error) =>
			setErrorMessage(
				error.response?.status === 409
					? m.pickup_location_name_taken()
					: apiErrorMessage(error),
			),
	});

	const form = useForm({
		defaultValues: {
			name: pickup?.name ?? "",
			// The API serves "09:30:00"; the input works in HH:mm.
			time: pickup ? formatTime(pickup.time) : "",
		} as PickupLocationFormData,
		validators: { onSubmit: pickupLocationSchema },
		onSubmit: ({ value }) => mutate(pickupLocationSchema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!pickup };
};
