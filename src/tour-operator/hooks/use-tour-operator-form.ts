import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import {
	type TourOperatorFormData,
	tourOperatorSchema,
} from "../validators/tour-operator";

// Create-only. Operator details are immutable after creation: the backend has
// no PATCH /tour-operators/:id, by design — changing currency or timezone once
// an operator has slots/bookings would corrupt frozen prices and slot times.
export const useTourOperatorForm = () => {
	const navigate = useNavigate();
	const toast = useAppToast();
	const { refreshUser } = useAuth();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { mutate, isPending } = useMutation<
		string,
		AxiosError,
		TourOperatorFormData
	>({
		mutationFn: async (data) => {
			// 201 Created with a Location header, no body — parse the new id out.
			const { headers } = await authApi.post("/tour-operators", data);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: async (id) => {
			setErrorMessage(null);
			// Refetch the profile so the new operator (as OWNER, default) appears
			// before we navigate into it.
			await refreshUser();
			toast.success(m.tour_operator_created());
			navigate({
				to: "/tour-operators/$tourOperatorId",
				params: { tourOperatorId: id },
			});
		},
		onError: (error) => setErrorMessage(apiErrorMessage(error)),
	});

	const form = useForm({
		defaultValues: {
			name: "",
			address: "",
			timezoneId: "",
			currencyId: "",
		} as TourOperatorFormData,
		validators: { onSubmit: tourOperatorSchema },
		onSubmit: ({ value }) => {
			mutate(tourOperatorSchema.parse(value));
		},
	});

	return { form, isPending, errorMessage };
};
