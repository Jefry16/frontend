import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "./AppDetailField";

/** null = untranslated. */
export type TranslatedField = readonly [label: string, value: string | null];

// The read-only face of every per-locale editor: reads are ensureMember and
// writes are ensureAdmin, so a STAFF member gets the content rather than a form
// whose save would 403.
//
// The caller owns the field list, and flattens its own lists.
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
