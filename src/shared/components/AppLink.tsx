import { Link as RouterLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

// The app-styled router link — a thin wrapper over TanStack's Link that adds a
// smooth color transition and gives every in-app link one home.
//
// NB: the documented createLink helper is cast-free but hard-requires a
// RouterProvider at render, so it throws when a component renders without a real
// router (e.g. a router-less unit test). This thin wrapper renders gracefully
// anywhere. The impl takes the concrete Link props (no `any`); the single
// `as typeof RouterLink` on the export restores the generic signature so callers
// keep fully-typed `to` / `params`.
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
