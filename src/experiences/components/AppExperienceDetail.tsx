import { useNavigate } from "@tanstack/react-router";
import {
	CalendarDays,
	Compass,
	Eye,
	EyeOff,
	Languages,
	Pencil,
} from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { AppMetafieldsCard } from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { statusBadgeVariant, statusLabel } from "../format";
import { useExperience } from "../hooks/use-experience";
import { useExperienceActions } from "../hooks/use-experience-actions";
import type { Experience } from "../types";

// Read-only experience detail plus a Publish/Unpublish toggle via the shared action pattern. Owns its fetch
// (skeleton / 404 empty state). The list's name column links here.
export const AppExperienceDetail = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const navigate = useNavigate();
	const query = useExperience(tourOperatorId, experienceId);
	const { publish, unpublish } = useExperienceActions(
		tourOperatorId,
		experienceId,
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/experiences"
			params={{ tourOperatorId }}
		>
			{m.back_to_experiences()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

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
					<CardContent className="flex flex-col gap-5 sm:flex-row">
						<Skeleton className="aspect-video w-full sm:w-64" />
						<div className="flex flex-1 flex-col gap-4">
							<Skeleton className="h-5 w-24" />
							<div className="grid grid-cols-2 gap-4">
								{["a", "b", "c", "d"].map((k) => (
									<Skeleton key={k} className="h-8 w-full" />
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			}
		>
			{(experience) => {
				const actions: AppAction[] = [
					// First (the primary slot), matching the archive: scheduling
					// departures is the experience's most common follow-up action.
					{
						id: "add-availability",
						label: m.add_availability(),
						icon: CalendarDays,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/availability/new/$experienceId",
								params: { tourOperatorId, experienceId },
							}),
					},
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/experiences/$experienceId/edit",
								params: { tourOperatorId, experienceId },
							}),
					},
					{
						// ListExperienceTranslationsUseCase is ensureMember — STAFF may read them.
						id: "translations",
						label: m.translations(),
						icon: Languages,
						member: true,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/experiences/$experienceId/translations",
								params: { tourOperatorId, experienceId },
							}),
					},
					experience.published
						? {
								id: "unpublish",
								label: m.unpublish(),
								icon: EyeOff,
								pending: unpublish.isPending,
								onSelect: () => unpublish.mutate(),
							}
						: {
								id: "publish",
								label: m.publish(),
								icon: Eye,
								pending: publish.isPending,
								onSelect: () => publish.mutate(),
							},
				];
				return (
					<ExperienceView
						experience={experience}
						tourOperatorId={tourOperatorId}
						actions={actions}
						canWrite={canWrite}
					/>
				);
			}}
		</AppResourceView>
	);
};

const ExperienceView = ({
	experience,
	tourOperatorId,
	actions,
	canWrite,
}: {
	experience: Experience;
	tourOperatorId: string;
	actions: AppAction[];
	canWrite: boolean;
}) => {
	const { formatDate } = useOperatorDateTime();
	const created = formatDate(experience.createdAt);

	return (
		<>
			<AppPageHeader
				title={experience.name}
				description={experience.description}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.catalog() },
							{
								label: m.experiences(),
								to: "/tour-operators/$tourOperatorId/experiences",
								params: { tourOperatorId },
							},
							{ label: experience.name },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>

			<div className="flex flex-col gap-6">
				<Card>
					<CardContent className="flex flex-col gap-5 sm:flex-row">
						<div className="shrink-0 sm:w-64">
							{experience.thumbnailUrl ? (
								<img
									src={experience.thumbnailUrl}
									alt={experience.name}
									className="aspect-video w-full rounded-md border object-cover"
								/>
							) : (
								<div className="grid aspect-video w-full place-items-center rounded-md border bg-muted text-muted-foreground">
									<Compass className="size-8" />
								</div>
							)}
						</div>
						<div className="flex flex-1 flex-col gap-4">
							<div className="flex flex-wrap gap-2">
								<AppBadge variant={statusBadgeVariant(experience.published)}>
									{statusLabel(experience.published)}
								</AppBadge>
								{experience.featured && (
									<AppBadge variant="secondary">{m.featured()}</AppBadge>
								)}
							</div>
							<dl className="grid grid-cols-2 gap-4">
								<AppDetailField label={m.booking_cutoff()}>
									{`${experience.bookingCutoffHours}h`}
								</AppDetailField>
								<AppDetailField label={m.slug()}>
									<span className="font-mono text-sm">{experience.handle}</span>
								</AppDetailField>
								<AppDetailField label={m.created()}>{created}</AppDetailField>
							</dl>
						</div>
					</CardContent>
				</Card>

				{experience.galleryUrls.length > 0 && (
					<Card>
						<CardContent className="flex flex-wrap gap-3">
							{experience.galleryUrls.map((url) => (
								<img
									key={url}
									src={url}
									alt=""
									className="h-20 w-28 rounded-md border object-cover"
								/>
							))}
						</CardContent>
					</Card>
				)}

				{experience.longDescription && (
					<Card>
						<CardHeader>
							<CardTitle>{m.about()}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm text-muted-foreground">
								{experience.longDescription}
							</p>
						</CardContent>
					</Card>
				)}
			</div>
			<AppMetafieldsCard
				tourOperatorId={tourOperatorId}
				ownerType="experience"
				ownerId={experience.id}
			/>
			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="EXPERIENCE"
				entityId={experience.id}
			/>
		</>
	);
};
