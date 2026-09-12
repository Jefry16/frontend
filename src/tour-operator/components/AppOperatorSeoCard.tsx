import { useForm } from "@tanstack/react-form";
import {
	AppDetailField,
	AppField,
	AppFormActions,
	AppFormSkeleton,
	AppImageDropzone,
	AppTextareaField,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	FieldDescription,
	FieldGroup,
	Label,
} from "@vointika/ui";
import { useState } from "react";
import { useMedia } from "#/media";
import * as m from "#/paraglide/messages";
import { AppQueryState } from "#/shared/components/AppQueryState";
import {
	useOperatorSeo,
	useOperatorSeoImageUpload,
	useOperatorSeoSave,
} from "../hooks/use-operator-seo";
import type { OperatorSeo } from "../types";
import {
	type OperatorSeoFormData,
	operatorSeoSchema,
} from "../validators/operator-seo";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = "image/jpeg,image/png,image/webp";

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
				<AppQueryState
					query={query}
					loading={<AppFormSkeleton rows={3} card={false} />}
				>
					{(seo) =>
						canWrite ? (
							<SeoForm tourOperatorId={tourOperatorId} seo={seo} />
						) : (
							<SeoSummary tourOperatorId={tourOperatorId} seo={seo} />
						)
					}
				</AppQueryState>
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
	const [imageId, setImageId] = useState(seo.ogImageMediaId);
	const [imageError, setImageError] = useState<string | null>(null);

	const save = useOperatorSeoSave(tourOperatorId);
	const upload = useOperatorSeoImageUpload(tourOperatorId);
	const image = useMedia(tourOperatorId, imageId);

	const form = useForm({
		defaultValues: {
			seoTitle: seo.seoTitle ?? "",
			seoDescription: seo.seoDescription ?? "",
		} as OperatorSeoFormData,
		validators: { onSubmit: operatorSeoSchema },
		onSubmit: ({ value }) => {
			const v = operatorSeoSchema.parse(value);
			save.mutate({
				seoTitle: v.seoTitle || null,
				seoDescription: v.seoDescription || null,
				ogImageMediaId: imageId,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<FieldGroup>
				<form.Field name="seoTitle">
					{(field) => (
						<AppField
							field={field}
							label={m.seo_title()}
							description={m.seo_title_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="seoDescription">
					{(field) => (
						<AppTextareaField
							field={field}
							label={m.seo_description()}
							description={m.seo_description_hint()}
							rows={3}
						/>
					)}
				</form.Field>
				<div className="space-y-2">
					<Label>{m.og_image()}</Label>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<AppImageDropzone
							className="size-28 min-h-0 shrink-0"
							previewUrl={image.data?.url ?? null}
							accept={IMAGE_TYPES}
							maxBytes={MAX_IMAGE_BYTES}
							pending={upload.isPending}
							disabled={upload.isPending || save.isPending}
							errorMessages={{
								wrongType: m.logo_wrong_type(),
								tooLarge: m.logo_too_large(),
							}}
							onFile={(file) => {
								setImageError(null);
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

const SeoSummary = ({
	tourOperatorId,
	seo,
}: {
	tourOperatorId: string;
	seo: OperatorSeo;
}) => {
	const image = useMedia(tourOperatorId, seo.ogImageMediaId);
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
