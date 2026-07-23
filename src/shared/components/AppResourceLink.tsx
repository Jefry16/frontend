import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";
import { AppLink } from "./AppLink";

// A resource link for table cells / references: an AppLink styled as an
// info-colored, hover-underlined link. Use on a cell whose text navigates to the
// row's detail (e.g. a member name → member detail). Preserves AppLink's typed
// to / params.
const AppResourceLinkImpl = ({
	className,
	...rest
}: ComponentProps<typeof AppLink>) => (
	<AppLink
		className={cn(
			"text-info underline-offset-2 hover:text-info/80 hover:underline",
			className,
		)}
		{...rest}
	/>
);

export const AppResourceLink = AppResourceLinkImpl as typeof AppLink;
