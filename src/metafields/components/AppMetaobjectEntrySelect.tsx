import {
	AppFormSkeleton,
	AppQueryState,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
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
			}}
		</AppQueryState>
	);
};
