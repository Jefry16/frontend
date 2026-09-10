import { cn } from "#/lib/utils";
import * as m from "#/paraglide/messages";

interface AppLocaleTabsProps {
	locales: string[];
	active: string | undefined;
	onSelect: (code: string) => void;
	translated: Set<string>;
	label: (code: string) => string;
}

export const AppLocaleTabs = ({
	locales,
	active,
	onSelect,
	translated,
	label,
}: AppLocaleTabsProps) => (
	<div
		className="inline-flex w-fit flex-wrap gap-0.5 rounded-md border bg-card p-0.5"
		role="tablist"
	>
		{locales.map((code) => (
			<button
				key={code}
				type="button"
				role="tab"
				aria-selected={active === code}
				onClick={() => onSelect(code)}
				className={cn(
					"inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
					active === code
						? "bg-background shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				{label(code)}
				<span
					role="img"
					className={cn(
						"size-1.5 rounded-full",
						translated.has(code) ? "bg-success" : "bg-muted-foreground/30",
					)}
					aria-label={
						translated.has(code) ? m.translated() : m.not_translated()
					}
				/>
			</button>
		))}
	</div>
);
