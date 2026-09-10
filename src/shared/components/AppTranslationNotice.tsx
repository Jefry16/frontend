import * as m from "#/paraglide/messages";
import { AppAlert } from "./AppAlert";

export const AppTranslationNotice = () => (
	<AppAlert
		variant="info"
		title={m.translation()}
		description={m.translation_fallback_help()}
	/>
);
