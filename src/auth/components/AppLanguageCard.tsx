import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { getLocale, type Locale } from "#/paraglide/runtime";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { useChangeUiLanguage } from "../hooks/use-change-ui-language";
import { useUiLanguages } from "../hooks/use-ui-languages";

// Each language labelled IN ITSELF ("English", "Español") — a user stuck in the
// wrong language can still find their own. Names come from Intl.DisplayNames, so
// a locale added to the allowlist needs no label code here.
const languageLabel = (code: string): string => {
	const name =
		new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;
	return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
};

// The admin interface-language picker: options from the backend allowlist
// (/ui-languages), current value from Paraglide. Changing it persists to the
// profile then reloads with the new catalog (via the mutation).
export const AppLanguageCard = () => {
	const languages = useUiLanguages();
	const changeLanguage = useChangeUiLanguage();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.interface_language()}</CardTitle>
				<CardDescription>{m.interface_language_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={languages}
					loading={<Skeleton className="h-9 w-full sm:max-w-xs" />}
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
				</AppCardBody>
			</CardContent>
		</Card>
	);
};
