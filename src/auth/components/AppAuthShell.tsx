import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

// The frame every signed-out and onboarding screen sits in: a centered column,
// the logo, and an optional heading over whatever the screen puts below.
//
// Three copies of this existed — AppAuthFormWrapper, AppAuthMessageCard and
// AppTourOperatorForm — and AppAuthMessageCard's own comment said it "mirrors
// AppAuthFormWrapper's frame so the static and form screens look identical",
// which is a rule with nothing holding it. Now there is one frame to change.
//
// It stops at the card on purpose. The three screens below it genuinely differ:
// one is a form, one is a message, and the onboarding page puts an alert and a
// sign-out *outside* the card. Folding those together would need slots for each,
// and the card body is not the part that has to stay identical — the frame is.
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
