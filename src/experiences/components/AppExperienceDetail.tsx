import { ArrowLeft, Compass, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppLink } from "#/shared/components/AppLink";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useCurrentTourOperator } from "#/tour-operator";
import { formatDuration, statusBadgeVariant, statusLabel } from "../format";
import { useExperience } from "../hooks/use-experience";
import { useExperienceActions } from "../hooks/use-experience-actions";
import type { Experience } from "../types";

// A labelled bulleted list, or a dash when empty.
const AppList = ({ label, items }: { label: string; items: string[] }) => (
	<AppDetailField label={label}>
		{items.length > 0 ? (
			<ul className="list-disc space-y-1 pl-4 text-sm font-normal">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		) : (
			<span className="text-muted-foreground">—</span>
		)}
	</AppDetailField>
);

// Read-only experience detail (media, publish state, facts, copy, inclusions)
// plus a Publish/Unpublish toggle via the shared action pattern. Owns its fetch
// (skeleton / 404 empty state). The list's name column links here.
export const AppExperienceDetail = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const query = useExperience(tourOperatorId, experienceId);
	const { publish, unpublish } = useExperienceActions(
		tourOperatorId,
		experienceId,
	);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/experiences"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_experiences()}
		</AppLink>
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
						timeZone={timeZone}
						actions={actions}
					/>
				);
			}}
		</AppResourceView>
	);
};

const ExperienceView = ({
	experience,
	tourOperatorId,
	timeZone,
	actions,
}: {
	experience: Experience;
	tourOperatorId: string;
	timeZone?: string;
	actions: AppAction[];
}) => {
	const created = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeZone,
	}).format(new Date(experience.createdAt));

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
				actions={<AppPageActions actions={actions} />}
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
								<AppDetailField label={m.duration()}>
									{formatDuration(experience.durationMinutes)}
								</AppDetailField>
								<AppDetailField label={m.booking_cutoff()}>
									{`${experience.bookingCutoffHours}h`}
								</AppDetailField>
								<AppDetailField label={m.slug()}>
									<span className="font-mono text-sm">{experience.slug}</span>
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

				<Card>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<AppList label={m.highlights()} items={experience.highlights} />
						<AppList label={m.whats_included()} items={experience.included} />
						<AppList label={m.not_included()} items={experience.notIncluded} />
						<AppDetailField label={m.tags()}>
							{experience.tags.length > 0 ? (
								<div className="flex flex-wrap gap-1.5">
									{experience.tags.map((tag) => (
										<AppBadge key={tag} variant="outline">
											{tag}
										</AppBadge>
									))}
								</div>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</AppDetailField>
					</CardContent>
				</Card>
			</div>
		</>
	);
};
