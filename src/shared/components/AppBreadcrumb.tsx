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

// One crumb: a label, plus optionally a typed route to link to. A crumb without
// `to` is a non-navigable label — e.g. a nav *section* like "Content".
type BreadcrumbCrumb = {
	label: ReactNode;
} & (Pick<LinkProps, "to" | "params"> | { to?: undefined; params?: undefined });

// The page breadcrumb trail (drop into AppPageHeader's `breadcrumb` slot).
// Convention: the LAST crumb is the current page — rendered as such, never a
// link. Earlier crumbs link when they carry a `to`, and render as muted plain
// text when they don't, so a non-navigable section label never masquerades as
// the current page (the archive rendered those as BreadcrumbPage, wrongly giving
// them aria-current + foreground colour — this doesn't).
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
