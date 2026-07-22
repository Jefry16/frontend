import type { ReactNode } from "react";

interface AppPageHeaderProps {
	title: string;
	description?: string;
	/** Right-aligned action buttons (create, etc.). */
	actions?: ReactNode;
	/** Optional breadcrumb slot above the title (nested pages). */
	breadcrumb?: ReactNode;
}

// The standard page header: title (+ optional description) with an optional
// breadcrumb above and an actions row on the right. Every operator page's
// content opens with one.
export const AppPageHeader = ({
	title,
	description,
	actions,
	breadcrumb,
}: AppPageHeaderProps) => {
	return (
		<div className="flex flex-col gap-4">
			{breadcrumb}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold">{title}</h1>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				{actions && (
					<div className="flex flex-wrap items-center gap-2">{actions}</div>
				)}
			</div>
		</div>
	);
};
