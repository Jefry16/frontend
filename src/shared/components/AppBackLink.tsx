import { ArrowLeft } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

// The quiet "back to the list" link — the standard notFoundAction on detail
// pages (and the escape hatch under edit-page 404s). Children are the label
// ("Back to experiences"); to/params stay typed via AppLink.
const AppBackLinkImpl = ({
	children,
	...rest
}: Omit<ComponentProps<typeof AppLink>, "children"> & {
	// Plain nodes only — the label sits after the arrow, so TanStack Link's
	// render-prop children form doesn't apply here.
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
