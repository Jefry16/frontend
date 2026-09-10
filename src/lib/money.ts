export const formatMoney = (amount: number, currency: string | null): string =>
	new Intl.NumberFormat(
		undefined,
		currency
			? { style: "currency", currency }
			: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
	).format(amount);
