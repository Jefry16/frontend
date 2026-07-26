import { useCurrentTourOperator } from "./use-current-tour-operator";

// "Today" as a local Date in the OPERATOR's timezone — the calendar lower bound
// for scheduling (the backend judges slot dates against the operator's local
// today, so the picker must too; the browser's own today can be a day off).
// en-CA formats as YYYY-MM-DD, giving clean numeric parts.
export const useOperatorToday = (): Date => {
	const tz = useCurrentTourOperator()?.timezone;
	const [y, mo, d] = new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
		.format(new Date())
		.split("-")
		.map(Number);
	return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1);
};
