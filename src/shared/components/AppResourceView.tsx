import type { UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { apiErrorMessage, isNotFound } from "#/lib/api-error";
import { AppError } from "./AppError";
import { AppNotFound } from "./AppNotFound";
import { AppPageHeader } from "./AppPageHeader";

interface Props<TData> {
	query: UseQueryResult<TData>;
	// Doubles as the AppNotFound label, so it names the entity, e.g. m.experience().
	resource: string;
	// The ENTITY's icon — the one its nav leaf and empty state already use, so a
	// resource reads as one glyph everywhere. Not a negation icon.
	icon?: LucideIcon;
	breadcrumb?: ReactNode;
	notFoundAction?: ReactNode;
	loading: ReactNode;
	// A callback, not a component, so it may NOT call hooks — `pnpm check` is the
	// gate that catches it. A body needing one becomes a named sub-component,
	// which is always the case for a hook taking the loaded record's id.
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
