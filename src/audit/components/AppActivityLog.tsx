import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppError } from "#/shared/components/AppError";
import { useCurrentTourOperator } from "#/tour-operator";
import {
	formatAuditAction,
	formatAuditActor,
	formatAuditField,
	formatAuditValue,
} from "../format";
import { useActivityLog } from "../hooks/use-activity-log";

// One entity's audit timeline (the Jira-style History) as a detail-page
// section: who did what, which fields changed from → to, when (operator tz),
// newest first with load-more. Actor names arrive ON each entry (frozen at
// write) — no roster fetch, no client-side join.
export const AppActivityLog = ({
	tourOperatorId,
	entityType,
	entityId,
}: {
	tourOperatorId: string;
	entityType: string;
	entityId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
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
	if (log.isError) return <AppError onRetry={() => log.refetch()} />;

	const entries = log.data.pages.flatMap((page) => page.data);
	if (entries.length === 0) {
		// A quiet empty line, not a full AppEmptyState — the timeline is a
		// section inside a detail page, and "no activity" isn't a first-run
		// state to fix with a CTA.
		return (
			<p className="text-sm text-muted-foreground">{m.activity_empty()}</p>
		);
	}

	const formatDateTime = (iso: string) =>
		new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone,
		}).format(new Date(iso));

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
								// A field can repeat (one capacity diff per tier) — the
								// position identifies the row in this static list.
								// biome-ignore lint/suspicious/noArrayIndexKey: static per-entry diff list
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
