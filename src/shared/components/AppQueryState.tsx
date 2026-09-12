import { AppError } from "@vointika/ui";
import type { ReactNode } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import type { QueryState } from "#/lib/query-state";

type Phase = "pending" | "error" | "loaded";

interface Props<TData> {
	query: QueryState<TData>;
	loading: ReactNode;
	chrome?: (body: ReactNode, phase: Phase) => ReactNode;
	children: (data: TData) => ReactNode;
}

const nothing = (body: ReactNode) => body == null || body === false;

export function AppQueryState<TData>({
	query,
	loading,
	chrome = (body) => body,
	children,
}: Props<TData>) {
	if (query.data === undefined) {
		if (query.isPending) return <>{chrome(loading, "pending")}</>;
		return (
			<>
				{chrome(
					<AppError
						description={apiErrorMessage(query.error)}
						onRetry={() => query.refetch()}
					/>,
					"error",
				)}
			</>
		);
	}

	const body = children(query.data);
	return nothing(body) ? null : <>{chrome(body, "loaded")}</>;
}
