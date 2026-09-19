import type { AnyFieldApi } from "@tanstack/react-form";
import {
	AppBadge,
	AppField,
	AppFormActions,
	AppFormCard,
	AppSelectField,
	Button,
	SelectItem,
} from "@vointika/ui";
import {
	ArrowDown,
	ArrowUp,
	CornerDownRight,
	Plus,
	Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import * as m from "#/paraglide/messages";
import { useOperatorLocales } from "#/session";
import { isResourceLink, MENU_LINK_TYPES, menuLinkTypeLabel } from "../format";
import { emptyMenuItem, useMenuItemsForm } from "../hooks/use-menu-items-form";
import type { Menu, MenuLinkType } from "../types";
import type { MenuItemFormNode } from "../validators/menu-items";
import { AppMenuTargetSelect } from "./AppMenuTargetSelect";

const MAX_DEPTH = 3;

interface TreeForm {
	Field: (props: {
		name: string;
		mode?: "array";
		children: (field: AnyFieldApi) => ReactNode;
	}) => ReactNode;
	setFieldValue: (path: string, value: unknown) => void;
	pushFieldValue: (path: string, value: unknown) => void;
	removeFieldValue: (path: string, index: number) => void;
	swapFieldValues: (path: string, from: number, to: number) => void;
}

export const AppMenuItemsEditor = ({
	tourOperatorId,
	menu,
}: {
	tourOperatorId: string;
	menu: Menu;
}) => {
	const { form, isPending, errorMessage } = useMenuItemsForm(
		tourOperatorId,
		menu,
	);
	const tree = form as unknown as TreeForm;
	const locales = useOperatorLocales(tourOperatorId);
	const extraLocales =
		locales.data?.supportedLocales.filter(
			(locale) => locale !== locales.data?.primaryLocale,
		) ?? [];

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			<tree.Field name="items" mode="array">
				{(items) =>
					items.state.value.length === 0 ? (
						<p className="text-sm text-muted-foreground">{m.no_menu_items()}</p>
					) : (
						<ItemRows
							form={tree}
							path="items"
							nodes={items.state.value}
							depth={1}
							tourOperatorId={tourOperatorId}
							extraLocales={extraLocales}
						/>
					)
				}
			</tree.Field>
			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => tree.pushFieldValue("items", emptyMenuItem())}
				>
					<Plus />
					{m.add_menu_item()}
				</Button>
			</div>
		</AppFormCard>
	);
};

interface RowsProps {
	form: TreeForm;
	path: string;
	nodes: MenuItemFormNode[];
	depth: number;
	tourOperatorId: string;
	extraLocales: string[];
}

const ItemRows = ({
	form,
	path,
	nodes,
	depth,
	tourOperatorId,
	extraLocales,
}: RowsProps) => (
	<div className="flex flex-col gap-3">
		{nodes.map((node, index) => {
			const rowPath = `${path}[${index}]`;
			return (
				// biome-ignore lint/suspicious/noArrayIndexKey: rows carry no id, so the index is the only identity available
				<div key={index} className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<div className="flex shrink-0 flex-col">
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={m.move_up()}
								disabled={index === 0}
								onClick={() => form.swapFieldValues(path, index, index - 1)}
							>
								<ArrowUp />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={m.move_down()}
								disabled={index === nodes.length - 1}
								onClick={() => form.swapFieldValues(path, index, index + 1)}
							>
								<ArrowDown />
							</Button>
						</div>
						<div className="flex min-w-0 grow flex-col gap-2">
							<div className="flex items-start gap-2">
								<form.Field name={`${rowPath}.title`}>
									{(field) => (
										<AppField
											field={field}
											label={m.title()}
											hideLabel
											placeholder={m.title()}
										/>
									)}
								</form.Field>
								<div className="w-44 shrink-0">
									<form.Field name={`${rowPath}.linkType`}>
										{(field) => (
											<AppSelectField
												field={field}
												label={m.menu_link_type()}
												hideLabel
												onValueChange={() => {
													form.setFieldValue(`${rowPath}.resourceId`, "");
													form.setFieldValue(`${rowPath}.url`, "");
												}}
											>
												{MENU_LINK_TYPES.map((type) => (
													<SelectItem key={type} value={type}>
														{menuLinkTypeLabel(type)}
													</SelectItem>
												))}
											</AppSelectField>
										)}
									</form.Field>
								</div>
							</div>
							<form.Field name={`${rowPath}.linkType`}>
								{(linkTypeField) => {
									const linkType = linkTypeField.state.value as MenuLinkType;
									return (
										<>
											{isResourceLink(linkType) && (
												<form.Field
													key={linkType}
													name={`${rowPath}.resourceId`}
												>
													{(field) => (
														<AppMenuTargetSelect
															kind={
																linkType as "EXPERIENCE" | "PAGE" | "CATEGORY"
															}
															tourOperatorId={tourOperatorId}
															value={field.state.value as string}
															onValueChange={(v) => field.handleChange(v)}
															label={m.menu_link_target()}
															errors={field.state.meta.errors}
														/>
													)}
												</form.Field>
											)}
											{linkType === "EXTERNAL_URL" && (
												<form.Field name={`${rowPath}.url`}>
													{(field) => (
														<AppField
															field={field}
															label={m.url()}
															hideLabel
															placeholder="https://"
														/>
													)}
												</form.Field>
											)}
										</>
									);
								}}
							</form.Field>
							{extraLocales.length > 0 && (
								<div className="flex flex-col gap-1.5">
									{extraLocales.map((locale) => (
										<div key={locale} className="flex items-center gap-2">
											<AppBadge
												variant="outline"
												className="w-10 shrink-0 justify-center font-mono uppercase"
											>
												{locale}
											</AppBadge>
											<div className="grow">
												<form.Field name={`${rowPath}.translations.${locale}`}>
													{(field) => (
														<AppField
															field={field}
															label={`${m.title()} (${locale})`}
															hideLabel
															placeholder={node.title || m.title()}
														/>
													)}
												</form.Field>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
						<div className="flex shrink-0 gap-1">
							{depth < MAX_DEPTH && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={m.add_sub_item()}
									onClick={() =>
										form.pushFieldValue(`${rowPath}.children`, emptyMenuItem())
									}
								>
									<CornerDownRight />
								</Button>
							)}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={m.remove()}
								onClick={() => form.removeFieldValue(path, index)}
							>
								<Trash2 />
							</Button>
						</div>
					</div>
					<form.Field name={`${rowPath}.children`} mode="array">
						{(children) =>
							children.state.value.length > 0 && (
								<div className="ml-8 border-l pl-4">
									<ItemRows
										form={form}
										path={`${rowPath}.children`}
										nodes={children.state.value}
										depth={depth + 1}
										tourOperatorId={tourOperatorId}
										extraLocales={extraLocales}
									/>
								</div>
							)
						}
					</form.Field>
				</div>
			);
		})}
	</div>
);
