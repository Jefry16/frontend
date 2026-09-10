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

type BreadcrumbCrumb = {
	label: ReactNode;
} & (Pick<LinkProps, "to" | "params"> | { to?: undefined; params?: undefined });

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
