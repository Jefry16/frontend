import { Languages } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppLink } from "./AppLink";

// Not AppEmptyState: this is an unmet prerequisite with a way out, not an empty
// resource list. `message` is the caller's so the copy can name what would be
// translated ("…to translate this experience").
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
