import { useQuery } from "@tanstack/react-query";
import { authApi } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import type { OperatorLocales } from "../locales";

// The operator's content languages (primary + supported set), read off the
// operator's own record: the `/locales` route was folded into
// `GET /tour-operators/{id}` alongside brand, seo and the storefront password.
//
// Same key as `useOperatorDetails` on purpose — one resource, one cache entry,
// one request, and a settings save that invalidates the operator refreshes every
// translation editor's language list for free.
//
// The response is typed as the slice this needs rather than the full record,
// because `session/` may not import `#/tour-operator` (it is imported by nearly
// every module, so it imports almost nothing). Both definitions fetch the same
// URL and store the same body; `use-operator-locales.test.ts` is what holds them
// to one request between them.
interface OperatorDetailSlice {
	locales: OperatorLocales;
}

export const useOperatorLocales = (tourOperatorId: string) =>
	useQuery({
		queryKey: queryKeys.operatorDetails(tourOperatorId),
		queryFn: async () => {
			const { data } = await authApi.get<OperatorDetailSlice>(
				`/tour-operators/${tourOperatorId}`,
			);
			return data;
		},
		// Plain property access: it returns the cached object's own reference, so
		// consumers keep a stable identity across renders. Building a new object
		// here would churn every dependent form's defaults.
		select: (data) => data.locales,
	});
