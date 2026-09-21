import { cn } from "@vointika/ui";
import type { ReactNode } from "react";

export const AppAuthShell = ({
	width = "sm",
	title,
	subtitle,
	children,
}: {
	width?: "sm" | "lg";
	title?: string;
	subtitle?: string;
	children: ReactNode;
}) => (
	<div className={cn("w-full", width === "lg" ? "max-w-lg" : "max-w-sm")}>
		<div className="mb-6 flex flex-col items-center gap-1 text-center">
			<img src="/vointika-logo.svg" alt="Vointika" className="mb-2 h-24" />
			{title && <h1 className="text-xl font-semibold">{title}</h1>}
			{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
		</div>
		{children}
	</div>
);
