import type { UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { apiErrorMessage, isNotFound } from "#/lib/api-error";
import { AppError } from "./AppError";
import { AppNotFound } from "./AppNotFound";
import { AppPageHeader } from "./AppPageHeader";

interface Props<TData> {
	query: UseQueryResult<TData>;
	resource: string;
	icon?: LucideIcon;
	breadcrumb?: ReactNode;
	notFoundAction?: ReactNode;
	loading: ReactNode;
	children: (data: TData) => ReactNode;
}

export function AppResourceView<TData>({
	query,
	resource,
	icon,
	breadcrumb,
	notFoundAction,
	loading,
	children,
}: Props<TData>) {
	const { data, isPending, error, refetch } = query;

	if (isPending) {
		return (
			<>
				<AppPageHeader title={resource} breadcrumb={breadcrumb} />
				{loading}
			</>
		);
	}

	if (error || data === undefined) {
		return (
			<>
				<AppPageHeader title={resource} breadcrumb={breadcrumb} />
				{isNotFound(error) ? (
					<AppNotFound
						resource={resource}
						icon={icon}
						action={notFoundAction}
					/>
				) : (
					<AppError
						description={apiErrorMessage(error)}
						onRetry={() => refetch()}
					/>
				)}
			</>
		);
	}

	return <>{children(data)}</>;
}
