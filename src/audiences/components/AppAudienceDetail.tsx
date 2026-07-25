import { ArrowLeft, UsersRound } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useCurrentTourOperator } from "#/tour-operator";
import { useAudience } from "../hooks/use-audience";

// Read-only audience detail: the tier's facts. Owns its fetch (skeleton / 404).
// Mutating actions (edit/delete) land as a later slice. The list's name column
// links here.
export const AppAudienceDetail = ({
	tourOperatorId,
	audienceId,
}: {
	tourOperatorId: string;
	audienceId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const query = useAudience(tourOperatorId, audienceId);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/audiences"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_audiences()}
		</AppLink>
	);

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
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="grid grid-cols-2 gap-4">
						{["a", "b"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(audience) => {
				const created = new Intl.DateTimeFormat(undefined, {
					dateStyle: "medium",
					timeZone,
				}).format(new Date(audience.createdAt));
				return (
					<>
						<AppPageHeader
							title={audience.name}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.catalog() },
										{
											label: m.audiences(),
											to: "/tour-operators/$tourOperatorId/audiences",
											params: { tourOperatorId },
										},
										{ label: audience.name },
									]}
								/>
							}
						/>
						<Card>
							<CardContent>
								<dl className="grid grid-cols-2 gap-4">
									<AppDetailField label={m.pax_per_unit()}>
										{audience.paxPerUnit}
									</AppDetailField>
									<AppDetailField label={m.created()}>{created}</AppDetailField>
								</dl>
							</CardContent>
						</Card>
					</>
				);
			}}
		</AppResourceView>
	);
};
