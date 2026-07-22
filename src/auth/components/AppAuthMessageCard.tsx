import { CircleCheck, CircleX, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { cn } from "#/lib/utils";

type AppAuthMessageTone = "success" | "destructive";

const ICONS: Record<AppAuthMessageTone, LucideIcon> = {
	success: CircleCheck,
	destructive: CircleX,
};

const COLORS: Record<AppAuthMessageTone, string> = {
	success: "text-success",
	destructive: "text-destructive",
};

interface AppAuthMessageCardProps {
	/** Renders the matching result icon (CircleCheck / CircleX). */
	tone?: AppAuthMessageTone;
	/** Custom leading node when no tone fits (e.g. a Spinner while verifying). */
	icon?: ReactNode;
	title?: string;
	description: string;
	/** Action link(s) rendered under the message. */
	children?: ReactNode;
}

// Centered, logo-topped card for the non-form auth states (verification result,
// invalid-link, "check your email"). Mirrors AppAuthFormWrapper's frame so the
// static and form screens look identical.
export const AppAuthMessageCard = ({
	tone,
	icon,
	title,
	description,
	children,
}: AppAuthMessageCardProps) => {
	const ToneIcon = tone ? ICONS[tone] : null;
	return (
		<div className="w-full max-w-sm">
			<div className="mb-6 flex flex-col items-center gap-1 text-center">
				<img src="/vointika-logo.svg" alt="Vointika" className="mb-2 h-28" />
			</div>
			<Card>
				<CardContent className="flex flex-col items-center gap-4 text-center">
					{tone && ToneIcon ? (
						<ToneIcon className={cn("size-10", COLORS[tone])} />
					) : (
						icon
					)}
					<div className="space-y-1">
						{title && <h1 className="text-lg font-semibold">{title}</h1>}
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
					{children}
				</CardContent>
			</Card>
		</div>
	);
};
