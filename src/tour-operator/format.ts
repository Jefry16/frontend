import type { OperatorAddress } from "./types";

export const addressLines = (address: OperatorAddress): string[] =>
	[
		address.address1,
		address.address2,
		[address.zip, address.city].filter(Boolean).join(" "),
		address.province,
		address.countryName,
	].filter((line): line is string => !!line && line.trim().length > 0);
