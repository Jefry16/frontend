import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";

// The rule every per-locale editor runs on: an empty field is not a blank
// translation, it is *no* translation, and the storefront falls back to the
// canonical text. Say it once at the top of the form rather than per field.
//
// It goes in AppFormCard's `notice` slot, which is above the error banner — the
// fallback rule is context for the whole form, so it stays put while a save
// error comes and goes beneath it.
export const AppTranslationNotice = () => (
	<AppAlert
		variant="info"
		title={m.translation()}
		description={m.translation_fallback_help()}
	/>
);
