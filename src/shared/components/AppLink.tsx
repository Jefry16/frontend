import { Link as RouterLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

const AppLinkImpl = ({
	className,
	...rest
}: ComponentProps<typeof RouterLink>) => (
	<RouterLink
		className={cn("transition-colors duration-150", className)}
		{...rest}
	/>
);

export const AppLink = AppLinkImpl as typeof RouterLink;
