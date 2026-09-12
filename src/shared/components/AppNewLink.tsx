import { Button } from "@vointika/ui";
import { Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

const AppNewLinkImpl = ({
	children,
	...rest
}: Omit<ComponentProps<typeof AppLink>, "children"> & {
	children?: ReactNode;
}) => (
	<Button asChild>
		<AppLink {...rest}>
			<Plus />
			{children}
		</AppLink>
	</Button>
);

export const AppNewLink = AppNewLinkImpl as typeof AppLink;
