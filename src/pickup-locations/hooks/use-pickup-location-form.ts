import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import type { Audience } from "#/audiences";
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

export const usePickupLocationForm = (
	tourOperatorId: string,
	audiences: readonly Audience[],
	pickup?: PickupLocation,
) => {
	const schema = pickupLocationSchema(audiences.map((a) => a.id));
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
			queryClient.invalidateQueries({
				queryKey: queryKeys.activity(tourOperatorId),
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
			time: pickup ? formatTime(pickup.time) : "",
			prices: Object.fromEntries(
				audiences.map((a) => {
					const paid = pickup?.audiencePrices.find(
						(p) => p.audienceId === a.id,
					)?.price;
					return [a.id, paid ? String(paid) : ""];
				}),
			),
		} as PickupLocationFormData,
		validators: { onSubmit: schema },
		onSubmit: ({ value }) => mutate(schema.parse(value)),
	});

	return { form, isPending, errorMessage, isEdit: !!pickup };
};
