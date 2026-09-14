import { Link, type LinkProps } from "@tanstack/react-router";
import { createAppLinks } from "@vointika/ui";
import type { ReactNode } from "react";

const links = createAppLinks(Link);

export const AppLink = links.AppLink as unknown as typeof Link;
export const AppBackLink = links.AppBackLink as unknown as typeof Link;
export const AppNewLink = links.AppNewLink as unknown as typeof Link;
export const AppResourceLink = links.AppResourceLink as unknown as typeof Link;

type Crumb = { label: ReactNode } & (
	| Pick<LinkProps, "to" | "params">
	| { to?: undefined; params?: undefined }
);

export const AppBreadcrumb = links.AppBreadcrumb as unknown as (props: {
	items: Crumb[];
}) => ReactNode;
