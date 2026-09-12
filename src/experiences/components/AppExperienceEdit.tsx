import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { Compass } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useExperience } from "../hooks/use-experience";
import { AppExperienceForm } from "./AppExperienceForm";

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
			loading={<AppFormSkeleton rows={4} />}
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
