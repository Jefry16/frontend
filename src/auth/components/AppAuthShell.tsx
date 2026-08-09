import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

// Stops above the card on purpose: the screens below it genuinely differ (a
// form, a message, and onboarding's alert and sign-out that sit OUTSIDE the
// card). The frame is the part that has to stay identical, not the body.
export const AppAuthShell = ({
	width = "sm",
	title,
	subtitle,
	children,
}: {
	/** `lg` is the onboarding form, whose four fields need the room. */
	width?: "sm" | "lg";
	title?: string;
	subtitle?: string;
	children: ReactNode;
}) => (
	<div className={cn("w-full", width === "lg" ? "max-w-lg" : "max-w-sm")}>
		<div className="mb-6 flex flex-col items-center gap-1 text-center">
			<img src="/vointika-logo.svg" alt="Vointika" className="mb-2 h-28" />
			{title && (
				<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
			)}
			{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
		</div>
		{children}
	</div>
);
