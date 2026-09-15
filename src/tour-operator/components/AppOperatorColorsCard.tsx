import {
	AppColorField,
	AppDetailField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSettingsCard,
	Button,
	EmptyValue,
	FieldLabel,
} from "@vointika/ui";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import * as m from "#/paraglide/messages";
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
		<AppSettingsCard
			title={m.brand_colors()}
			description={m.brand_colors_hint()}
		>
			<AppQueryState
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
			</AppQueryState>
		</AppSettingsCard>
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
		<AppForm
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			{ROLES.map((role) => (
				<form.Field key={role.name} name={role.name} mode="array">
					{(group) => {
						const rows = group.state.value ?? [];
						return (
							<div className="flex flex-col gap-3">
								<FieldLabel>{role.label()}</FieldLabel>
								{rows.map((_, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: a colour row has no identity but its position
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
		</AppForm>
	);
};

const ColorsSummary = ({ brand }: { brand: Brand }) => (
	<dl className="flex flex-col gap-6">
		{ROLES.map((role) => {
			const colors = brand.colors[role.name];
			return (
				<AppDetailField key={role.name} label={role.label()}>
					{colors.length === 0 ? (
						<EmptyValue />
					) : (
						<div className="flex flex-col gap-2">
							{colors.map((color, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: a colour row has no identity but its position
								<Swatch key={index} color={color} />
							))}
						</div>
					)}
				</AppDetailField>
			);
		})}
	</dl>
);
