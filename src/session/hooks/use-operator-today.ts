import { useCurrentTourOperator } from "./use-current-tour-operator";

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
