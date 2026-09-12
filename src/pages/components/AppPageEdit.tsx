import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { FileText } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { usePage } from "../hooks/use-page";
import { AppPageForm } from "./AppPageForm";

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
			loading={<AppFormSkeleton rows={3} />}
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
