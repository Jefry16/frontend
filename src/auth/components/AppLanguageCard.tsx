import {
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { getLocale, type Locale } from "#/paraglide/runtime";
import { useChangeUiLanguage } from "../hooks/use-change-ui-language";
import { useUiLanguages } from "../hooks/use-ui-languages";

const languageLabel = (code: string): string => {
	const name =
		new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;
	return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
};

export const AppLanguageCard = () => {
	const languages = useUiLanguages();
	const changeLanguage = useChangeUiLanguage();

	return (
		<AppSettingsCard
			title={m.interface_language()}
			description={m.interface_language_description()}
		>
			<AppQueryState
				query={languages}
				loading={<AppFormSkeleton rows={1} card={false} />}
			>
				{(options) => (
					<Select
						value={getLocale()}
						onValueChange={(value) => changeLanguage.mutate(value as Locale)}
						disabled={changeLanguage.isPending}
					>
						<SelectTrigger className="w-full sm:max-w-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{options.map((code) => (
									<SelectItem key={code} value={code}>
										{languageLabel(code)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				)}
			</AppQueryState>
		</AppSettingsCard>
	);
};
