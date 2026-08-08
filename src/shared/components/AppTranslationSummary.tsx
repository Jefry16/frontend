import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "./AppDetailField";

/** One row: the field's label and this locale's override, or null if untranslated. */
export type TranslatedField = readonly [label: string, value: string | null];

// The read-only face of every per-locale editor, for a member who may read
// translations (ensureMember) but not write them (ensureAdmin). It shows what
// this locale overrides, saying "not translated" rather than rendering an empty
// row — so a STAFF member keeps the read access they have instead of meeting a
// form whose save would 403.
//
// The caller owns the field list because only it knows the resource's shape,
// and flattens its own lists (a translated `highlights` joins to one string).
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
