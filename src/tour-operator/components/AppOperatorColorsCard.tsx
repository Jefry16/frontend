import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldLabel } from "#/components/ui/field";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppColorField } from "#/shared/components/AppColorField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { useBrand, useBrandColorsForm } from "../hooks/use-operator-brand";
import type { Brand, BrandColor } from "../types";

const Swatch = ({ color }: { color: BrandColor }) => (
	<div className="flex items-center gap-2">
		<span
			aria-hidden
			className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border font-medium text-xs"
			style={{ backgroundColor: color.background, color: color.foreground }}
		>
			Aa
		</span>
		<span className="font-mono text-muted-foreground text-xs">
			{color.background} / {color.foreground}
		</span>
	</div>
);

export const AppOperatorColorsCard = ({
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
				<CardTitle>{m.brand_colors()}</CardTitle>
				<CardDescription>{m.brand_colors_hint()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={query}
					loading={<AppFormSkeleton rows={2} card={false} />}
				>
					{(brand) =>
						canWrite ? (
							<ColorsForm tourOperatorId={tourOperatorId} brand={brand} />
						) : (
							<ColorsSummary brand={brand} />
						)
					}
				</AppCardBody>
			</CardContent>
		</Card>
	);
};

const ROLES = [
	{ name: "primary", label: () => m.brand_primary() },
	{ name: "secondary", label: () => m.brand_secondary() },
] as const;

const ColorsForm = ({
	tourOperatorId,
	brand,
}: {
	tourOperatorId: string;
	brand: Brand;
}) => {
	const { form, isPending, errorMessage } = useBrandColorsForm(
		tourOperatorId,
		brand,
	);

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}

			{ROLES.map((role) => (
				<form.Field key={role.name} name={role.name} mode="array">
					{(group) => {
						const rows = group.state.value ?? [];
						return (
							<div className="flex flex-col gap-3">
								<FieldLabel>{role.label()}</FieldLabel>
								{rows.map((_, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: see above
									<div key={index} className="flex items-end gap-2">
										<div className="flex-1">
											<form.Field name={`${role.name}[${index}].background`}>
												{(field) => (
													<AppColorField
														field={field}
														label={m.brand_background()}
														hideLabel={index > 0}
													/>
												)}
											</form.Field>
										</div>
										<div className="flex-1">
											<form.Field name={`${role.name}[${index}].foreground`}>
												{(field) => (
													<AppColorField
														field={field}
														label={m.brand_foreground()}
														hideLabel={index > 0}
													/>
												)}
											</form.Field>
										</div>
										<div className="flex shrink-0 items-center gap-1 pb-1">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												aria-label={m.move_up()}
												disabled={index === 0}
												onClick={() =>
													form.swapFieldValues(role.name, index, index - 1)
												}
											>
												<ArrowUp />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												aria-label={m.move_down()}
												disabled={index === rows.length - 1}
												onClick={() =>
													form.swapFieldValues(role.name, index, index + 1)
												}
											>
												<ArrowDown />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												aria-label={m.remove()}
												onClick={() => form.removeFieldValue(role.name, index)}
											>
												<X />
											</Button>
										</div>
									</div>
								))}
								<div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											form.pushFieldValue(role.name, {
												background: "#000000",
												foreground: "#ffffff",
											})
										}
									>
										<Plus />
										{m.add_color()}
									</Button>
								</div>
							</div>
						);
					}}
				</form.Field>
			))}

			<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
		</form>
	);
};

const ColorsSummary = ({ brand }: { brand: Brand }) => {
	const groups = ROLES.map((role) => ({
		label: role.label(),
		colors: brand.colors[role.name],
	})).filter((g) => g.colors.length > 0);

	if (groups.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">{m.brand_colors_empty()}</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{groups.map((group) => (
				<div key={group.label} className="flex flex-col gap-2">
					<FieldLabel>{group.label}</FieldLabel>
					<div className="flex flex-col gap-2">
						{group.colors.map((color, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: see above
							<Swatch key={index} color={color} />
						))}
					</div>
				</div>
			))}
		</div>
	);
};
