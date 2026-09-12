import { AppError, Button, Skeleton, Spinner } from "@vointika/ui";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime } from "#/session";
import {
	formatAuditAction,
	formatAuditActor,
	formatAuditField,
	formatAuditValue,
} from "../format";
import { useActivityLog } from "../hooks/use-activity-log";

export const AppActivityLog = ({
	tourOperatorId,
	entityType,
	entityId,
}: {
	tourOperatorId: string;
	entityType: string;
	entityId: string;
}) => {
	const { formatDateTime } = useOperatorDateTime();
	const log = useActivityLog(tourOperatorId, entityType, entityId);

	if (log.isPending) {
		return (
			<div data-testid="activity-log-skeleton" className="flex flex-col gap-4">
				{[0, 1, 2].map((row) => (
					<div key={row} className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-2/3 max-w-md" />
						<Skeleton className="h-3.5 w-1/2 max-w-sm" />
					</div>
				))}
			</div>
		);
	}
	if (log.isError)
		return (
			<AppError
				description={apiErrorMessage(log.error)}
				onRetry={() => log.refetch()}
			/>
		);

	const entries = log.data.pages.flatMap((page) => page.data);
	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">{m.activity_empty()}</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<ol className="flex flex-col gap-4">
				{entries.map((entry) => (
					<li key={entry.id} className="flex flex-col gap-1">
						<div className="text-sm">
							<span className="font-medium">{formatAuditActor(entry)}</span>{" "}
							{formatAuditAction(entry.action)}
							<span className="text-muted-foreground">
								{" · "}
								{formatDateTime(entry.createdAt)}
							</span>
						</div>
						{entry.changes?.map((change, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: a field can repeat (one capacity diff per tier), so position is the identity
								key={index}
								className="text-sm text-muted-foreground"
							>
								{formatAuditField(change.field)}
								{": "}
								{formatAuditValue(change.from)}
								{" → "}
								{formatAuditValue(change.to)}
							</div>
						))}
					</li>
				))}
			</ol>
			{log.hasNextPage && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="self-start"
					onClick={() => log.fetchNextPage()}
					disabled={log.isFetchingNextPage}
				>
					{log.isFetchingNextPage && <Spinner className="size-4" />}
					{m.load_more()}
				</Button>
			)}
		</div>
	);
};
