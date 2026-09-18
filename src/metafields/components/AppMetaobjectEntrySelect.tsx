import {
	AppFormSkeleton,
	AppQueryState,
	AppSelect,
	SelectItem,
	useAllPages,
} from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

interface EntryRow {
	id: string;
	definitionId: string;
	handle: string;
	name: string;
}

export const AppMetaobjectEntrySelect = ({
	inputId,
	tourOperatorId,
	metaobjectDefinitionId,
	value,
	onValueChange,
}: {
	inputId: string;
	tourOperatorId: string;
	metaobjectDefinitionId: string;
	value: string;
	onValueChange: (value: string) => void;
}) => {
	const catalogue = useAllPages<EntryRow>(
		queryKeys.metaobjects(tourOperatorId),
		`/tour-operators/${tourOperatorId}/metaobjects`,
	);

	return (
		<AppQueryState
			query={catalogue}
			loading={<AppFormSkeleton rows={1} card={false} />}
		>
			{(rows) => {
				const entries = rows.filter(
					(row) => row.definitionId === metaobjectDefinitionId,
				);
				return (
					<AppSelect
						id={inputId}
						value={value}
						onValueChange={(v) => onValueChange(v === "unset" ? "" : v)}
						placeholder={m.not_set()}
					>
						<SelectItem value="unset">{m.not_set()}</SelectItem>
						{entries.map((entry) => (
							<SelectItem key={entry.id} value={entry.id}>
								{entry.name}
								<span className="ml-2 font-mono text-xs text-muted-foreground">
									{entry.handle}
								</span>
							</SelectItem>
						))}
					</AppSelect>
				);
			}}
		</AppQueryState>
	);
};
