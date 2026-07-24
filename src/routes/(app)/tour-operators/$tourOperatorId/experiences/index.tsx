import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { AppExperiencesList } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/",
)({
	component: ExperiencesPage,
});

// Experiences — the operator's sellable products. Table page → full width.
function ExperiencesPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.experiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.experiences() }]}
					/>
				}
				actions={
					<Button asChild>
						<AppLink
							to="/tour-operators/$tourOperatorId/experiences/new"
							params={{ tourOperatorId }}
						>
							<Plus />
							{m.new_experience()}
						</AppLink>
					</Button>
				}
			/>
			<AppExperiencesList tourOperatorId={tourOperatorId} />
		</div>
	);
}
