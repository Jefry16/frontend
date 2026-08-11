/**
 * An amount in the operator's currency.
 *
 * `currency` is an ISO 4217 code, which is what `Intl.NumberFormat` wants: it
 * picks the symbol AND the currency's own decimal count (2 for EUR, 0 for JPY).
 * A symbol would give the first and lose the second.
 *
 * Null falls back to a plain two-decimal number rather than throwing. That is
 * reachable: the code rides the profile, so anything rendering money before the
 * profile resolves — or against a backend older than the field — has no code to
 * pass, and a price is more useful unlabelled than absent.
 */
export const formatMoney = (amount: number, currency: string | null): string =>
	new Intl.NumberFormat(
		undefined,
		currency
			? { style: "currency", currency }
			: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
	).format(amount);
