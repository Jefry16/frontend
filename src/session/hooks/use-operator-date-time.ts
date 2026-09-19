import { useMemo } from "react";
import { getLocale } from "#/paraglide/runtime";
import { useCurrentTourOperator } from "./use-current-tour-operator";

export const useOperatorDateTime = () => {
	const timeZone = useCurrentTourOperator()?.timezone;

	return useMemo(() => {
		const locale = getLocale();
		const date = new Intl.DateTimeFormat(locale, {
			dateStyle: "medium",
			timeZone,
		});
		const dateTime = new Intl.DateTimeFormat(locale, {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone,
		});
		const timestamp = new Intl.DateTimeFormat(locale, {
			dateStyle: "medium",
			timeStyle: "medium",
			timeZone,
		});
		return {
			formatDate: (iso: string) => date.format(new Date(iso)),
			formatDateTime: (iso: string) => dateTime.format(new Date(iso)),
			formatTimestamp: (iso: string) => timestamp.format(new Date(iso)),
		};
	}, [timeZone]);
};
