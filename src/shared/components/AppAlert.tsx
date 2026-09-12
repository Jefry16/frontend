import {
	CircleAlert,
	Info,
	type LucideIcon,
	TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { cn } from "#/lib/utils";

type AppAlertVariant = "destructive" | "warning" | "info";

const ICONS: Record<AppAlertVariant, LucideIcon> = {
	destructive: CircleAlert,
	warning: TriangleAlert,
	info: Info,
};

const COLORS: Record<AppAlertVariant, string> = {
	destructive:
		"text-destructive *:data-[slot=alert-description]:text-destructive/90",
	warning: "text-warning *:data-[slot=alert-description]:text-warning/90",
	info: "text-info *:data-[slot=alert-description]:text-info/90",
};

interface AppAlertProps {
	variant?: AppAlertVariant;
	title?: string;
	description: string;
	className?: string;
}

export const AppAlert = ({
	variant = "destructive",
	title,
	description,
	className,
}: AppAlertProps) => {
	const Icon = ICONS[variant];
	return (
		<Alert className={cn(COLORS[variant], className)}>
			<Icon />
			{title && <AlertTitle>{title}</AlertTitle>}
			<AlertDescription>{description}</AlertDescription>
		</Alert>
	);
};
