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
import { Spinner } from "#/components/ui/spinner";
import { Textarea } from "#/components/ui/textarea";
import * as m from "#/paraglide/messages";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { EmptyValue } from "#/shared/components/EmptyValue";
import { useBrand, useBrandActions } from "../hooks/use-operator-brand";
import type { Brand, BrandImageSlot } from "../types";
import { AppBrandImageSlot } from "./AppBrandImageSlot";

const SLOGAN_MAX = 80;
const SHORT_DESCRIPTION_MAX = 150;

// The shop's brand: the four images a theme reads, plus the slogan and short
// description the storefront shows beside them.
//
// This release does NOT edit the palette or the social links, but every write
// still sends them — `PUT /brand` is a full replace, so a body without them
// clears them. `useBrandActions` takes the loaded brand and spreads over it for
// exactly that reason.
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
				{query.isPending || !query.data ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : (
					<BrandBody
						tourOperatorId={tourOperatorId}
						brand={query.data}
						canWrite={canWrite}
					/>
				)}
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
	const { setImage, clearImage, saveText } = useBrandActions(
		tourOperatorId,
		brand,
	);
	const [slogan, setSlogan] = useState(brand.slogan ?? "");
	const [shortDescription, setShortDescription] = useState(
		brand.shortDescription ?? "",
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
						// Blank collapses to null so the storefront falls back rather than
						// rendering an empty line.
						saveText.mutate({
							slogan: slogan.trim() || null,
							shortDescription: shortDescription.trim() || null,
						});
					}}
				>
					<FieldGroup>
						<div className="space-y-2">
							<Label htmlFor="brand-slogan">{m.brand_slogan()}</Label>
							<Input
								id="brand-slogan"
								value={slogan}
								maxLength={SLOGAN_MAX}
								onChange={(e) => setSlogan(e.target.value)}
							/>
							<FieldDescription>{m.brand_slogan_hint()}</FieldDescription>
						</div>
						<div className="space-y-2">
							<Label htmlFor="brand-short-description">
								{m.brand_short_description()}
							</Label>
							<Textarea
								id="brand-short-description"
								rows={3}
								value={shortDescription}
								maxLength={SHORT_DESCRIPTION_MAX}
								onChange={(e) => setShortDescription(e.target.value)}
							/>
							<FieldDescription>
								{m.brand_short_description_hint()}
							</FieldDescription>
						</div>
					</FieldGroup>
					<Button type="submit" disabled={saveText.isPending}>
						{saveText.isPending && <Spinner />}
						{m.save_changes()}
					</Button>
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
