import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldDescription, FieldGroup } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Skeleton } from "#/components/ui/skeleton";
import { Textarea } from "#/components/ui/textarea";
import * as m from "#/paraglide/messages";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppImageDropzone } from "#/shared/components/AppImageDropzone";
import {
	useOperatorSeo,
	useOperatorSeoImage,
	useOperatorSeoImageUpload,
	useOperatorSeoSave,
} from "../hooks/use-operator-seo";
import type { OperatorSeo } from "../types";

// The backend's OperatorSeoTitle / OperatorSeoDescription value objects.
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 320;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

// Settings → General → Search engine listing: the shop's canonical SEO text
// plus the og:image, which Translations then overrides per locale.
const CardSkeleton = () => (
	<div className="flex flex-col gap-4">
		{["a", "b", "c"].map((k) => (
			<Skeleton key={k} className="h-9 w-full" />
		))}
	</div>
);

export const AppOperatorSeoCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useOperatorSeo(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.seo()}</CardTitle>
				<CardDescription>{m.seo_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody query={query} loading={<CardSkeleton />}>
					{(seo) =>
						canWrite ? (
							<SeoForm tourOperatorId={tourOperatorId} seo={seo} />
						) : (
							<SeoSummary tourOperatorId={tourOperatorId} seo={seo} />
						)
					}
				</AppCardBody>
			</CardContent>
		</Card>
	);
};

const SeoForm = ({
	tourOperatorId,
	seo,
}: {
	tourOperatorId: string;
	seo: OperatorSeo;
}) => {
	const [title, setTitle] = useState(seo.seoTitle ?? "");
	const [description, setDescription] = useState(seo.seoDescription ?? "");
	const [imageId, setImageId] = useState(seo.ogImageMediaId);
	const [imageError, setImageError] = useState<string | null>(null);

	const save = useOperatorSeoSave(tourOperatorId);
	const upload = useOperatorSeoImageUpload(tourOperatorId);
	const image = useOperatorSeoImage(tourOperatorId, imageId);

	const submit = () => {
		// A full replace: blank collapses to null so the field falls back, and
		// the untouched image id rides along rather than being cleared.
		save.mutate({
			seoTitle: title.trim() || null,
			seoDescription: description.trim() || null,
			ogImageMediaId: imageId,
		});
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			className="space-y-4"
		>
			<FieldGroup>
				<div className="space-y-2">
					<Label htmlFor="seo-title">{m.seo_title()}</Label>
					<Input
						id="seo-title"
						value={title}
						maxLength={TITLE_MAX}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<FieldDescription>{m.seo_title_hint()}</FieldDescription>
				</div>
				<div className="space-y-2">
					<Label htmlFor="seo-description">{m.seo_description()}</Label>
					<Textarea
						id="seo-description"
						value={description}
						rows={3}
						maxLength={DESCRIPTION_MAX}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<FieldDescription>{m.seo_description_hint()}</FieldDescription>
				</div>
				<div className="space-y-2">
					<Label>{m.og_image()}</Label>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<AppImageDropzone
							className="size-28 min-h-0 shrink-0"
							previewUrl={image.data?.url ?? null}
							accept="image/*"
							maxBytes={MAX_IMAGE_BYTES}
							pending={upload.isPending}
							disabled={upload.isPending || save.isPending}
							errorMessages={{
								wrongType: m.logo_wrong_type(),
								tooLarge: m.logo_too_large(),
							}}
							onFile={(file) => {
								setImageError(null);
								// Upload now to mint the id; Save is what persists it.
								upload.mutate(file, { onSuccess: setImageId });
							}}
							onError={setImageError}
						/>
						<div className="flex flex-col items-start gap-2">
							<FieldDescription>{m.og_image_hint()}</FieldDescription>
							{imageId && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={upload.isPending || save.isPending}
									onClick={() => setImageId(null)}
								>
									{m.remove_og_image()}
								</Button>
							)}
						</div>
					</div>
					{imageError && (
						<p className="text-sm text-destructive">{imageError}</p>
					)}
				</div>
			</FieldGroup>
			<AppFormActions
				isPending={save.isPending}
				disabled={upload.isPending}
				submitLabel={m.save_changes()}
			/>
		</form>
	);
};

// Read-only for a member who may read the settings but not write them.
const SeoSummary = ({
	tourOperatorId,
	seo,
}: {
	tourOperatorId: string;
	seo: OperatorSeo;
}) => {
	const image = useOperatorSeoImage(tourOperatorId, seo.ogImageMediaId);
	const none = <span className="text-muted-foreground">{m.not_set()}</span>;

	return (
		<dl className="flex flex-col gap-6">
			<AppDetailField label={m.seo_title()}>
				{seo.seoTitle ?? none}
			</AppDetailField>
			<AppDetailField label={m.seo_description()}>
				{seo.seoDescription ?? none}
			</AppDetailField>
			<AppDetailField label={m.og_image()}>
				{image.data?.url ? (
					<img
						src={image.data.url}
						alt={m.og_image()}
						className="size-28 rounded-md border object-cover"
					/>
				) : (
					none
				)}
			</AppDetailField>
		</dl>
	);
};
