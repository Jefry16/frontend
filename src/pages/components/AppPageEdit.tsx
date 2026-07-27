import { FileText } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { usePage } from "../hooks/use-page";
import { AppPageForm } from "./AppPageForm";

// The edit page: loads the record, then renders the form seeded with it.
export const AppPageEdit = ({
	tourOperatorId,
	pageId,
}: {
	tourOperatorId: string;
	pageId: string;
}) => {
	const query = usePage(tourOperatorId, pageId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/pages"
			params={{ tourOperatorId }}
		>
			{m.back_to_pages()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.edit_page()}
			icon={FileText}
			breadcrumb={
				<AppBreadcrumb items={[{ label: m.content() }, { label: m.pages() }]} />
			}
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(page) => (
				<>
					<AppPageHeader
						title={m.edit_page()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.pages(),
										to: "/tour-operators/$tourOperatorId/content/pages",
										params: { tourOperatorId },
									},
									{
										label: page.title,
										to: "/tour-operators/$tourOperatorId/content/pages/$pageId",
										params: { tourOperatorId, pageId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppPageForm tourOperatorId={tourOperatorId} page={page} />
				</>
			)}
		</AppResourceView>
	);
};
