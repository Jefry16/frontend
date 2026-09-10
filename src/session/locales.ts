import { getLocale } from "#/paraglide/runtime";

export interface OperatorLocales {
	primaryLocale: string;
	supportedLocales: string[];
}

export const localeLabel = (code: string, fallback?: string): string => {
	try {
		const name = new Intl.DisplayNames([getLocale()], {
			type: "language",
			fallback: "none",
		}).of(code);
		if (name) return name.charAt(0).toUpperCase() + name.slice(1);
	} catch {}
	return fallback ?? code;
};
