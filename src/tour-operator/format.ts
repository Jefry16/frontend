import type { OperatorAddress } from "./types";

/**
 * The postal address as lines, for display. The structured shape is for
 * editing; a reader wants an address, so the optional parts drop out rather
 * than leaving blank lines, and the resolved country name closes it.
 */
export const addressLines = (address: OperatorAddress): string[] =>
	[
		address.address1,
		address.address2,
		[address.zip, address.city].filter(Boolean).join(" "),
		address.province,
		address.countryName,
	].filter((line): line is string => !!line && line.trim().length > 0);
