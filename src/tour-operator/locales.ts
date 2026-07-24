import { getLocale } from "#/paraglide/runtime";

// The operator's content-language settings (`GET/PATCH /locales`): the
// default/primary locale plus the full supported set, as bare locale codes.
export interface OperatorLocales {
	primaryLocale: string;
	supportedLocales: string[];
}

/**
 * A locale code's language name IN THE CURRENT UI LANGUAGE — "es" reads as
 * "Spanish" in an English admin, "español" in a Spanish one. The names come from
 * the browser's Unicode CLDR data via Intl.DisplayNames, so there's no static
 * list to maintain: WHICH languages are offerable is the backend allowlist's job
 * (`useLanguages`), and this only labels them. `fallback` (the allowlist's own
 * `name`) covers a code CLDR doesn't know; failing that, the raw code shows.
 */
export const localeLabel = (code: string, fallback?: string): string => {
	try {
		const name = new Intl.DisplayNames([getLocale()], {
			type: "language",
			fallback: "none",
		}).of(code);
		// CLDR lowercases some endonyms (e.g. "español"); title-case the first
		// letter so options read as labels regardless of the UI language.
		if (name) return name.charAt(0).toUpperCase() + name.slice(1);
	} catch {
		// Malformed code or an environment without full ICU — fall through.
	}
	return fallback ?? code;
};
