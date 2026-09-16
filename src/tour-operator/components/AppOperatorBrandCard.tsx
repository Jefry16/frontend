import {
	AppDetailField,
	AppField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	AppTextareaField,
	EmptyValue,
	FieldGroup,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import {
	useBrand,
	useBrandActions,
	useBrandTextForm,
} from "../hooks/use-operator-brand";
import type { Brand, BrandImageSlot } from "../types";
import { AppBrandImageSlot } from "./AppBrandImageSlot";

export const AppOperatorBrandCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useBrand(tourOperatorId);

	return (
		<AppSettingsCard title={m.brand()} description={m.brand_description()}>
			<AppQueryState
				query={query}
				loading={<AppFormSkeleton rows={2} card={false} />}
			>
				{(brand) => (
					<BrandBody
						tourOperatorId={tourOperatorId}
						brand={brand}
						canWrite={canWrite}
					/>
				)}
			</AppQueryState>
		</AppSettingsCard>
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
	const { setImage, clearImage } = useBrandActions(tourOperatorId);
	const { form, isPending, errorMessage } = useBrandTextForm(
		tourOperatorId,
		brand,
	);

	const imagePending = setImage.isPending || clearImage.isPending;
	const slotPending = (slot: BrandImageSlot) =>
		(setImage.isPending && setImage.variables?.slot === slot) ||
		(clearImage.isPending && clearImage.variables === slot);
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
				<AppForm
					onSubmit={form.handleSubmit}
					errorMessage={errorMessage}
					actions={
						<AppFormActions
							isPending={isPending}
							submitLabel={m.save_changes()}
						/>
					}
				>
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
				</AppForm>
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
						pending={slotPending(s.slot)}
						disabled={imagePending}
						onFile={(slot, file) => setImage.mutate({ slot, file })}
						onClear={(slot) => clearImage.mutate(slot)}
					/>
				))}
			</div>
		</div>
	);
};
