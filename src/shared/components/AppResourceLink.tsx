import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";
import { AppLink } from "./AppLink";

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
