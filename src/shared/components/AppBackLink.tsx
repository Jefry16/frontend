import { ArrowLeft } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

const AppBackLinkImpl = ({
	children,
	...rest
}: Omit<ComponentProps<typeof AppLink>, "children"> & {
	children?: ReactNode;
}) => (
	<AppLink
		className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		{...rest}
	>
		<ArrowLeft className="size-4" />
		{children}
	</AppLink>
);

export const AppBackLink = AppBackLinkImpl as typeof AppLink;
