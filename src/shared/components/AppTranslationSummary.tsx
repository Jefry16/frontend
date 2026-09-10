import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "./AppDetailField";

export type TranslatedField = readonly [label: string, value: string | null];

export const AppTranslationSummary = ({
	fields,
}: {
	fields: readonly TranslatedField[];
}) => (
	<Card>
		<CardContent>
			<dl className="flex flex-col gap-6">
				{fields.map(([label, value]) => (
					<AppDetailField key={label} label={label}>
						{value ?? (
							<span className="text-muted-foreground">
								{m.not_translated()}
							</span>
						)}
					</AppDetailField>
				))}
			</dl>
		</CardContent>
	</Card>
);
