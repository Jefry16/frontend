import { AppCard } from "@vointika/ui";
import { Languages } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/links";

export const AppNoTranslatableLocales = ({
	tourOperatorId,
}: {
	tourOperatorId: string;
}) => (
	<AppCard variant="notice">
		<Languages className="size-8 text-muted-foreground" />
		<p className="text-sm text-muted-foreground">
			{m.translations_no_languages()}
		</p>
		<AppLink
			to="/tour-operators/$tourOperatorId/settings/languages"
			params={{ tourOperatorId }}
			className="text-sm font-medium text-primary hover:underline"
		>
			{m.manage_languages()}
		</AppLink>
	</AppCard>
);
