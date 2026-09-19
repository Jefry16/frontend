import { AppCard, cn } from "@vointika/ui";
import { CircleCheck, type LucideIcon, OctagonX } from "lucide-react";
import type { ReactNode } from "react";
import { AppAuthShell } from "./AppAuthShell";

type AppAuthMessageTone = "success" | "destructive";

const ICONS: Record<AppAuthMessageTone, LucideIcon> = {
	success: CircleCheck,
	destructive: OctagonX,
};

const COLORS: Record<AppAuthMessageTone, string> = {
	success: "text-success",
	destructive: "text-destructive",
};

interface AppAuthMessageCardProps {
	tone?: AppAuthMessageTone;
	icon?: ReactNode;
	title?: string;
	description: string;
	children?: ReactNode;
}

export const AppAuthMessageCard = ({
	tone,
	icon,
	title,
	description,
	children,
}: AppAuthMessageCardProps) => {
	const ToneIcon = tone ? ICONS[tone] : null;
	return (
		<AppAuthShell>
			<AppCard className="flex flex-col items-center gap-4 text-center">
				{tone && ToneIcon ? (
					<ToneIcon className={cn("size-8", COLORS[tone])} />
				) : (
					icon
				)}
				<div className="space-y-1">
					{title && <h1 className="text-xl font-semibold">{title}</h1>}
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
				{children}
			</AppCard>
		</AppAuthShell>
	);
};
