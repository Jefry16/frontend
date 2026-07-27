import { Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "#/components/ui/button";
import { AppLink } from "./AppLink";

// The "create one" call to action — a primary button-styled link with the Plus
// icon: list-page headers, first-run empty states, prerequisite guards.
// Children are the label ("New audience"); to/params stay typed via AppLink.
// NOT for buttons that open dialogs (those are real onClick Buttons).
const AppNewLinkImpl = ({
	children,
	...rest
}: Omit<ComponentProps<typeof AppLink>, "children"> & {
	// Plain nodes only — the label follows the icon, so TanStack Link's
	// render-prop children form doesn't apply here.
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
