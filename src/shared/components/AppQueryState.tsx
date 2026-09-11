import type { ReactNode } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import type { QueryState } from "#/lib/query-state";
import { AppError } from "./AppError";

interface Props<TData> {
	query: QueryState<TData>;
	loading: ReactNode;
	chrome?: (body: ReactNode) => ReactNode;
	children: (data: TData) => ReactNode;
}

export function AppQueryState<TData>({
	query,
	loading,
	chrome = (body) => body,
	children,
}: Props<TData>) {
	if (query.isPending) return <>{chrome(loading)}</>;

	if (query.error || query.data === undefined) {
		return (
			<>
				{chrome(
					<AppError
						description={apiErrorMessage(query.error)}
						onRetry={() => query.refetch()}
					/>,
				)}
			</>
		);
	}

	const body = children(query.data);
	return body === null ? null : <>{chrome(body)}</>;
}
