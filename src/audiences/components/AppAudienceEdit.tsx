import { AppFormSkeleton, AppPageHeader } from "@vointika/ui";
import { UsersRound } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppBreadcrumb } from "#/shared/links";
import { useAudience } from "../hooks/use-audience";
import { AppAudienceForm } from "./AppAudienceForm";

export const AppAudienceEdit = ({
	tourOperatorId,
	audienceId,
}: {
	tourOperatorId: string;
	audienceId: string;
}) => {
	const query = useAudience(tourOperatorId, audienceId);

	return (
		<AppResourceView
			query={query}
			resource={m.audience()}
			icon={UsersRound}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.audiences() }]}
				/>
			}
			loading={<AppFormSkeleton rows={3} />}
		>
			{(audience) => (
				<>
					<AppPageHeader
						title={m.edit_audience()}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.catalog() },
									{
										label: m.audiences(),
										to: "/tour-operators/$tourOperatorId/audiences",
										params: { tourOperatorId },
									},
									{
										label: audience.name,
										to: "/tour-operators/$tourOperatorId/audiences/$audienceId",
										params: { tourOperatorId, audienceId },
									},
									{ label: m.edit() },
								]}
							/>
						}
					/>
					<AppAudienceForm
						tourOperatorId={tourOperatorId}
						audience={audience}
					/>
				</>
			)}
		</AppResourceView>
	);
};
