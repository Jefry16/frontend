import { Languages } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppLink } from "./AppLink";

// Every translation editor's "nothing to translate into" state: the primary
// locale IS the canonical text, so an operator with one configured language has
// nothing to overlay. Deliberately not AppEmptyState — that one requires a
// title, renders its icon in a muted disc, and is scoped to a genuinely empty
// resource list. This is an unmet prerequisite with a way out.
//
// `message` is the caller's because the copy names what would be translated
// ("…to translate this experience"); the generic sentence is the default.
export const AppNoTranslatableLocales = ({
	tourOperatorId,
	message = m.translations_no_languages_generic(),
}: {
	tourOperatorId: string;
	message?: string;
}) => (
	<Card>
		<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
			<Languages className="size-8 text-muted-foreground" />
			<p className="text-sm text-muted-foreground">{message}</p>
			<AppLink
				to="/tour-operators/$tourOperatorId/settings/languages"
				params={{ tourOperatorId }}
				className="text-sm font-medium text-primary hover:underline"
			>
				{m.manage_languages()}
			</AppLink>
		</CardContent>
	</Card>
);
