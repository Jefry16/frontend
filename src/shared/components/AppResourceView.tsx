import type { UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { apiErrorMessage, isNotFound } from "#/lib/api-error";
import { AppError } from "./AppError";
import { AppNotFound } from "./AppNotFound";
import { AppPageHeader } from "./AppPageHeader";

interface Props<TData> {
	query: UseQueryResult<TData>;
	// Section title (loading/error header) AND the AppNotFound resource label,
	// e.g. m.experience().
	resource: string;
	// AppNotFound icon.
	icon?: LucideIcon;
	// The SECTION breadcrumb shown in the loading / 404 / error header, e.g.
	// "Catalog / Experiences" — before the specific record resolves.
	breadcrumb?: ReactNode;
	// The 404 way-out (e.g. a back-to-list link).
	notFoundAction?: ReactNode;
	// The tailored loading body (a skeleton), shown under the section header.
	loading: ReactNode;
	// The success render: the page's own header (title = the record) + body.
	children: (data: TData) => ReactNode;
}

// The state machine every by-id detail page shares: a section header + tailored
// skeleton while loading, a 404 → AppNotFound / any other error → AppError (with
// retry) — both keeping the header + breadcrumb visible — and on success the page
// renders its own header + body via `children`. Consolidates what each detail
// used to hand-roll (isPending / isNotFound(error) ? … : …).
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
