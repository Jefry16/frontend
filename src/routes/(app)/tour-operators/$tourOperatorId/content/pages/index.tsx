import { createFileRoute } from "@tanstack/react-router";
import { AppPagesList } from "#/pages";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/",
)({
	component: PagesPage,
});

// Pages: the operator's static storefront content (About, Contact, policies).
function PagesPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.pages()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.pages() }]}
					/>
				}
				actions={
					<AppNewLink
						to="/tour-operators/$tourOperatorId/content/pages/new"
						params={{ tourOperatorId }}
					>
						{m.new_page()}
					</AppNewLink>
				}
			/>
			<AppPagesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
