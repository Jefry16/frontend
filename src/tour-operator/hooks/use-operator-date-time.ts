import { useMemo } from "react";
import { useCurrentTourOperator } from "./use-current-tour-operator";

// Formats server instants (ISO timestamps) in the OPERATOR's timezone — the
// business runs on its local clock, not the viewer's. The single home of that
// rule: components take these formatters instead of plumbing `timezone` into
// hand-rolled Intl calls (where a forgotten timeZone option silently shows the
// viewer's clock). NOT for operator-local wall-clock values (slot startAt) or
// form-value display (AppDateField/AppTimeField) — those are deliberately
// timezone-free.
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
			/** "Jul 26, 2026" — facts and createdAt columns. */
			formatDate: (iso: string) => date.format(new Date(iso)),
			/** "Jul 26, 2026, 2:30 PM" — activity rows and timelines. */
			formatDateTime: (iso: string) => dateTime.format(new Date(iso)),
			/** "Jul 26, 2026, 2:30:05 PM" — the audit entry's precise stamp. */
			formatTimestamp: (iso: string) => timestamp.format(new Date(iso)),
		};
	}, [timeZone]);
};
