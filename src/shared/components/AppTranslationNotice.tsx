import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";

// An empty field is not a blank translation, it is *no* translation — the
// storefront falls back to the canonical text.
export const AppTranslationNotice = () => (
	<AppAlert
		variant="info"
		title={m.translation()}
		description={m.translation_fallback_help()}
	/>
);
