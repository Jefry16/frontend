import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppToast } from "@vointika/ui";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useAuth } from "#/auth";
import { authApi } from "#/lib/api";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import {
	type TourOperatorFormData,
	tourOperatorSchema,
} from "../validators/tour-operator";

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
			const { headers } = await authApi.post("/tour-operators", data);
			const id = (headers.location ?? "").split("/").pop();
			if (!id) throw new Error("Missing Location header on create response");
			return id;
		},
		onSuccess: async (id) => {
			setErrorMessage(null);
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
			address: {
				address1: "",
				address2: "",
				city: "",
				province: "",
				zip: "",
			},
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
