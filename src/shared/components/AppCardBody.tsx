import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiErrorMessage } from "#/lib/api-error";
import { AppError } from "./AppError";

interface Props<TData> {
	query: UseQueryResult<TData>;
	/** The tailored placeholder (a skeleton), shown in the card while loading. */
	loading: ReactNode;
	children: (data: TData) => ReactNode;
}

// What AppResourceView is to a page, this is to a card: pending → the caller's
// skeleton, failure → AppError with a retry, success → `children`.
//
// It is deliberately NOT AppResourceView. That one owns a whole page — it
// renders a header and a breadcrumb, and answers a 404 with AppNotFound. A
// settings card is one of several on a page that already has a header, and its
// singleton read cannot 404 for a valid operator, so both of those would be
// wrong here. What the two share is the rule that a failed read must say so.
//
// Drop it inside a CardContent — it does not render the Card, so the header
// stays visible while the body is loading or broken.
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
