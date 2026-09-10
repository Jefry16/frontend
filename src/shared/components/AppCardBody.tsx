import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import { AppError } from "./AppError";

interface Props<TData> {
	query: UseQueryResult<TData>;
	loading: ReactNode;
	children: (data: TData) => ReactNode;
}

export function AppCardBody<TData>({ query, loading, children }: Props<TData>) {
	const { data, isPending, error, refetch } = query;

	if (isPending) return <>{loading}</>;

	if (error || data === undefined) {
		return (
			<AppError
				description={apiErrorMessage(error)}
				onRetry={() => refetch()}
			/>
		);
	}

	return <>{children(data)}</>;
}
