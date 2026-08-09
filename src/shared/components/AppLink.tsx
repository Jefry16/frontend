import { Link as RouterLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

// Not the documented createLink helper: that one hard-requires a RouterProvider
// at render, so it throws in a router-less unit test. The single
// `as typeof RouterLink` on the export restores the generic `to` / `params`.
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
