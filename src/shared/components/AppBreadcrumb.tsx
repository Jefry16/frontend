import type { LinkProps } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { AppLink } from "./AppLink";

// A crumb without `to` is a non-navigable label — a nav section like "Content".
type BreadcrumbCrumb = {
	label: ReactNode;
} & (Pick<LinkProps, "to" | "params"> | { to?: undefined; params?: undefined });

// The LAST crumb is the current page and never a link. An earlier crumb without
// a `to` renders as muted text rather than BreadcrumbPage, so a section label
// does not claim aria-current.
export function AppBreadcrumb({ items }: { items: BreadcrumbCrumb[] }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					const key = `${i}-${typeof item.label === "string" ? item.label : ""}`;
					return (
						<Fragment key={key}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : item.to ? (
									<BreadcrumbLink asChild>
										<AppLink to={item.to} params={item.params}>
											{item.label}
										</AppLink>
									</BreadcrumbLink>
								) : (
									<span>{item.label}</span>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
