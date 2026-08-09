import { useMemo } from "react";
import { useCurrentTourOperator } from "./use-current-tour-operator";

// Server instants in the OPERATOR's timezone: the business runs on its own
// clock, and a hand-rolled Intl call that forgets `timeZone` silently shows the
// viewer's. NOT for wall-clock values (slot startAt) or form-value display —
// those are timezone-free on purpose.
export const useOperatorDateTime = () => {
	const timeZone = useCurrentTourOperator()?.timezone;

	return useMemo(() => {
		const date = new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeZone,
		});
		const dateTime = new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone,
		});
		const timestamp = new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "medium",
			timeZone,
		});
		return {
			/** "Jul 26, 2026" */
			formatDate: (iso: string) => date.format(new Date(iso)),
			/** "Jul 26, 2026, 2:30 PM" */
			formatDateTime: (iso: string) => dateTime.format(new Date(iso)),
			/** "Jul 26, 2026, 2:30:05 PM" */
			formatTimestamp: (iso: string) => timestamp.format(new Date(iso)),
		};
	}, [timeZone]);
};
