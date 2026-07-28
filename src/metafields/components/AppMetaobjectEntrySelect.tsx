import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import { useAllPages } from "#/hooks/use-all-pages";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

// The row shape we need from GET /metaobjects — declared locally: importing
// the metaobjects module here would close a cycle (it already imports this
// module's barrel for the typed inputs).
interface EntryRow {
	id: string;
	definitionId: string;
	handle: string;
	name: string;
}

// The metaobject_reference value picker: the entries of the definition's
// PINNED metaobject type, by display name (handle as the hint). "Not set"
// clears. The bounded whole-catalogue fetch is shared with the entries
// tables via the query key.
export const AppMetaobjectEntrySelect = ({
	inputId,
	tourOperatorId,
	metaobjectDefinitionId,
	value,
	onValueChange,
}: {
	inputId: string;
	tourOperatorId: string;
	/** The pinned metaobject type whose entries are valid values. */
	metaobjectDefinitionId: string;
	value: string;
	onValueChange: (value: string) => void;
}) => {
	const catalogue = useAllPages<EntryRow>(
		queryKeys.metaobjects(tourOperatorId),
		`/tour-operators/${tourOperatorId}/metaobjects`,
	);

	if (catalogue.isPending) {
		return <Skeleton className="h-9 w-full" />;
	}
	// Without this, a failed fetch renders an empty select that reads as
	// "Not set" — a lie about the stored value.
	if (catalogue.isError) {
		return <p className="text-sm text-destructive">{m.error()}</p>;
	}
	const entries = catalogue.rows.filter(
		(row) => row.definitionId === metaobjectDefinitionId,
	);

	return (
		<Select
			value={value || undefined}
			onValueChange={(v) => onValueChange(v === "unset" ? "" : v)}
		>
			<SelectTrigger id={inputId} className="w-full">
				<SelectValue placeholder={m.not_set()} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="unset">{m.not_set()}</SelectItem>
					{entries.map((entry) => (
						<SelectItem key={entry.id} value={entry.id}>
							{entry.name}
							<span className="ml-2 font-mono text-xs text-muted-foreground">
								{entry.handle}
							</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
