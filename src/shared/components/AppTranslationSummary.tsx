import { Card, CardContent } from "#/components/ui/card";
import { useUiLabels } from "../labels";
import { AppDetailField } from "./AppDetailField";

export type TranslatedField = readonly [label: string, value: string | null];

export const AppTranslationSummary = ({
	fields,
}: {
	fields: readonly TranslatedField[];
}) => {
	const labels = useUiLabels();
	return (
		<Card>
			<CardContent>
				<dl className="flex flex-col gap-6">
					{fields.map(([label, value]) => (
						<AppDetailField key={label} label={label}>
							{value ?? (
								<span className="text-muted-foreground">
									{labels.notTranslated}
								</span>
							)}
						</AppDetailField>
					))}
				</dl>
			</CardContent>
		</Card>
	);
};
