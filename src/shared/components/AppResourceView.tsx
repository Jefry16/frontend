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
	// AppNotFound icon — the ENTITY's icon, the same one its leaf carries in
	// `tour-operator/nav-items.ts` and its list's empty state, so a resource reads
	// as one glyph everywhere. Not a negation icon: three pages used to send
	// FileX/UserX/MailX, which gave media a different symbol when it was missing
	// than when there was none yet. AppNotFound's own FileQuestion default covers
	// a caller with no entity icon to give.
	icon?: LucideIcon;
	// The SECTION breadcrumb shown in the loading / 404 / error header, e.g.
	// "Catalog / Experiences" — before the specific record resolves.
	breadcrumb?: ReactNode;
	// The 404 way-out (e.g. a back-to-list link).
	notFoundAction?: ReactNode;
	// The tailored loading body (a skeleton), shown under the section header.
	loading: ReactNode;
	// The success render: the page's own header (title = the record) + body.
	//
	// This is a plain callback, not a component, so it may NOT call hooks —
	// `lint/correctness/useHookAtTopLevel` rejects it and `pnpm check` is a gate.
	// (It happens to survive at runtime, verified against React 19 through a
	// success → error transition, so the lint is the thing that stops you, not a
	// crash.) So: a body needing a hook of its own becomes a named sub-component
	// — always the case when a hook takes the LOADED record's id, e.g.
	// `useMenuActions(tourOperatorId, menu.id)`, which the parent can't call
	// because the id doesn't exist until the query resolves. A body needing only
	// a formatter inlines here, with `useOperatorDateTime()` hoisted to the parent.
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
