import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppTextareaField } from "#/shared/components/AppTextareaField";
import { EmptyValue } from "#/shared/components/EmptyValue";
import {
	useBrand,
	useBrandActions,
	useBrandTextForm,
} from "../hooks/use-operator-brand";
import type { Brand, BrandImageSlot } from "../types";
import { AppBrandImageSlot } from "./AppBrandImageSlot";

// This card does not edit the palette or social links, but every write still
// sends them: `PUT /brand` is a full replace, so a body without them clears
// them. That is why useBrandActions spreads over the loaded brand.
export const AppOperatorBrandCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useBrand(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.brand()}</CardTitle>
				<CardDescription>{m.brand_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={query}
					loading={
						<div className="flex flex-col gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					}
				>
					{(brand) => (
						<BrandBody
							tourOperatorId={tourOperatorId}
							brand={brand}
							canWrite={canWrite}
						/>
					)}
				</AppCardBody>
			</CardContent>
		</Card>
	);
};

const BrandBody = ({
	tourOperatorId,
	brand,
	canWrite,
}: {
	tourOperatorId: string;
	brand: Brand;
	canWrite: boolean;
}) => {
	const { setImage, clearImage } = useBrandActions(tourOperatorId, brand);
	const { form, isPending, errorMessage } = useBrandTextForm(
		tourOperatorId,
		brand,
	);

	const imagePending = setImage.isPending || clearImage.isPending;
	const slots: { slot: BrandImageSlot; label: string; hint: string }[] = [
		{ slot: "logoMediaId", label: m.logo(), hint: m.brand_logo_hint() },
		{
			slot: "squareLogoMediaId",
			label: m.brand_square_logo(),
			hint: m.brand_square_logo_hint(),
		},
		{
			slot: "faviconMediaId",
			label: m.brand_favicon(),
			hint: m.brand_favicon_hint(),
		},
		{
			slot: "coverImageMediaId",
			label: m.brand_cover(),
			hint: m.brand_cover_hint(),
		},
	];

	return (
		<div className="flex flex-col gap-6">
			{canWrite ? (
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
					<FieldGroup>
						<form.Field name="slogan">
							{(field) => (
								<AppField
									field={field}
									label={m.brand_slogan()}
									description={m.brand_slogan_hint()}
								/>
							)}
						</form.Field>
						<form.Field name="shortDescription">
							{(field) => (
								<AppTextareaField
									field={field}
									label={m.brand_short_description()}
									description={m.brand_short_description_hint()}
									rows={3}
								/>
							)}
						</form.Field>
					</FieldGroup>
					<AppFormActions
						isPending={isPending}
						submitLabel={m.save_changes()}
					/>
				</form>
			) : (
				<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<AppDetailField label={m.brand_slogan()}>
						{brand.slogan ?? <EmptyValue />}
					</AppDetailField>
					<AppDetailField label={m.brand_short_description()}>
						{brand.shortDescription ?? <EmptyValue />}
					</AppDetailField>
				</dl>
			)}

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{slots.map((s) => (
					<AppBrandImageSlot
						key={s.slot}
						tourOperatorId={tourOperatorId}
						slot={s.slot}
						label={s.label}
						hint={s.hint}
						mediaId={brand[s.slot]}
						canWrite={canWrite}
						pending={imagePending}
						onFile={(slot, file) => setImage.mutate({ slot, file })}
						onClear={(slot) => clearImage.mutate(slot)}
					/>
				))}
			</div>
		</div>
	);
};
