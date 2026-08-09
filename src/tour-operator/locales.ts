import { getLocale } from "#/paraglide/runtime";

// Content languages — the operator's storefront locales, not the admin UI's.
export interface OperatorLocales {
	primaryLocale: string;
	supportedLocales: string[];
}

/**
 * Names a locale in the CURRENT UI language — "es" reads as "Spanish" in an
 * English admin, "español" in a Spanish one. Labelling only: WHICH languages
 * are offerable is the backend allowlist's job (`useLanguages`).
 */
export const localeLabel = (code: string, fallback?: string): string => {
	try {
		const name = new Intl.DisplayNames([getLocale()], {
			type: "language",
			fallback: "none",
		}).of(code);
		// CLDR lowercases some endonyms ("español"), which reads wrong as an option.
		if (name) return name.charAt(0).toUpperCase() + name.slice(1);
	} catch {
		// Malformed code, or an environment without full ICU.
	}
	return fallback ?? code;
};
