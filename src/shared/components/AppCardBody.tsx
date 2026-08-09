import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import { AppError } from "./AppError";

interface Props<TData> {
	query: UseQueryResult<TData>;
	/** A skeleton, shown in the card while loading. */
	loading: ReactNode;
	children: (data: TData) => ReactNode;
}

// What AppResourceView is to a page, this is to a card — and deliberately not
// the same component: that one renders a header and answers a 404 with
// AppNotFound, and a settings card has a header already and cannot 404.
//
// Goes INSIDE a CardContent, so the header stays visible while the body loads.
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
