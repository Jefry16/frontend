import { AppBadge, AppDetailField } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { localeLabel, type OperatorLocales } from "#/session";

export const AppOperatorLanguagesSummary = ({
	locales,
}: {
	locales: OperatorLocales;
}) => (
	<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<AppDetailField label={m.primary_language()}>
			{localeLabel(locales.primaryLocale)}
		</AppDetailField>
		<AppDetailField label={m.supported_languages()}>
			<div className="flex flex-wrap gap-1.5">
				{locales.supportedLocales.map((code) => (
					<AppBadge key={code} variant="secondary">
						{localeLabel(code)}
					</AppBadge>
				))}
			</div>
		</AppDetailField>
	</dl>
);
