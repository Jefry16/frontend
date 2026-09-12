import { Card, CardContent } from "@vointika/ui";
import { Languages } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppLink } from "./AppLink";

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
