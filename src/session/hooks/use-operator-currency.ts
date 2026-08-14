import { useCurrentTourOperator } from "./use-current-tour-operator";

// The operator's ISO 4217 code, for `formatMoney`. Null off an operator route,
// or before the profile resolves — which is why formatMoney takes null.
//
// It rides the profile summary, resolved server-side from `currency_id`, the
// same way `timezone` does. Joining the reference list client-side instead
// would cost two queries per money-bearing page and flip every price from
// "95.00" to "€95.00" when the second landed.
export const useOperatorCurrency = (): string | null =>
	useCurrentTourOperator()?.currency ?? null;
