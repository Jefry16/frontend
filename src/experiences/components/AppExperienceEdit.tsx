import { Compass } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useExperience } from "../hooks/use-experience";
import { AppExperienceForm } from "./AppExperienceForm";

// Edit page: fetch the experience, then prefill the form (which carries the
// arrays + media refs through unchanged). Owns its fetch (skeleton / 404 via
// AppResourceView). The detail's Edit action links here.
export const AppExperienceEdit = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const query = useExperience(tourOperatorId, experienceId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/experiences"
			params={{ tourOperatorId }}
		>
			{m.back_to_experiences()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.experience()}
			icon={Compass}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.experiences() }]}
				/>
			}
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c", "d"].map((k) => (
							<Skeleton key={k} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(experience) => (
				<>
					<AppPageHeader
						title={m.edit_experience()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.experiences(),
										to: "/tour-operators/$tourOperatorId/experiences",
										params: { tourOperatorId },
									},
									{
										label: experience.name,
										to: "/tour-operators/$tourOperatorId/experiences/$experienceId",
										params: { tourOperatorId, experienceId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppExperienceForm
						tourOperatorId={tourOperatorId}
						experience={experience}
					/>
				</>
			)}
		</AppResourceView>
	);
};
