import { useNavigate } from "@tanstack/react-router";
import {
	ArrowDown,
	ArrowUp,
	CornerDownRight,
	Plus,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { apiErrorMessage } from "#/lib/api-error";
import * as m from "#/paraglide/messages";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { useOperatorLocales } from "#/tour-operator";
import { isResourceLink, MENU_LINK_TYPES, menuLinkTypeLabel } from "../format";
import { useMenuActions } from "../hooks/use-menu-actions";
import type { Menu, MenuItemInput, MenuItemNode, MenuLinkType } from "../types";
import { AppMenuTargetSelect } from "./AppMenuTargetSelect";

const MAX_DEPTH = 3;

// One editable node. rowId is local identity (items get fresh backend ids on
// every save, so server ids can't key the rows across edits).
interface EditorRow {
	rowId: number;
	title: string;
	linkType: MenuLinkType;
	resourceId: string;
	url: string;
	translations: Record<string, string>;
	children: EditorRow[];
}

// The navigation editor: the menu's whole item tree, edited locally and saved
// WHOLESALE via PUT /items (the backend's write model — no per-item calls).
// Nest up to 3 levels; sibling order is position. Per-item title translations
// appear for each supported locale beyond the primary.
export const AppMenuItemsEditor = ({
	tourOperatorId,
	menu,
}: {
	tourOperatorId: string;
	menu: Menu;
}) => {
	const navigate = useNavigate();
	const { replaceItems } = useMenuActions(tourOperatorId, menu.id);
	const locales = useOperatorLocales(tourOperatorId);
	const extraLocales =
		locales.data?.supportedLocales.filter(
			(locale) => locale !== locales.data?.primaryLocale,
		) ?? [];

	const nextRowId = useRef(1);
	const toRows = (nodes: MenuItemNode[]): EditorRow[] =>
		nodes.map((node) => ({
			rowId: nextRowId.current++,
			title: node.title,
			linkType: node.linkType,
			resourceId: node.resourceId ?? "",
			url: node.url ?? "",
			translations: { ...node.titleTranslations },
			children: toRows(node.children),
		}));
	const [rows, setRows] = useState<EditorRow[]>(() => toRows(menu.items));
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Immutable tree ops, addressed by rowId.
	const mapTree = (
		nodes: EditorRow[],
		fn: (siblings: EditorRow[]) => EditorRow[],
	): EditorRow[] =>
		fn(nodes).map((node) => ({
			...node,
			children: mapTree(node.children, fn),
		}));

	const updateRow = (rowId: number, patch: Partial<EditorRow>) =>
		setRows((prev) =>
			mapTree(prev, (siblings) =>
				siblings.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)),
			),
		);

	const removeRow = (rowId: number) =>
		setRows((prev) =>
			mapTree(prev, (siblings) => siblings.filter((r) => r.rowId !== rowId)),
		);

	const moveRow = (rowId: number, delta: -1 | 1) =>
		setRows((prev) =>
			mapTree(prev, (siblings) => {
				const index = siblings.findIndex((r) => r.rowId === rowId);
				const target = index + delta;
				if (index < 0 || target < 0 || target >= siblings.length) {
					return siblings;
				}
				const next = [...siblings];
				[next[index], next[target]] = [next[target], next[index]];
				return next;
			}),
		);

	const newRow = (): EditorRow => ({
		rowId: nextRowId.current++,
		title: "",
		linkType: "HOME",
		resourceId: "",
		url: "",
		translations: {},
		children: [],
	});

	const addChild = (rowId: number) =>
		setRows((prev) =>
			mapTree(prev, (siblings) =>
				siblings.map((r) =>
					r.rowId === rowId ? { ...r, children: [...r.children, newRow()] } : r,
				),
			),
		);

	// Pre-flight what the backend enforces so a bad tree never leaves the page.
	const validate = (nodes: EditorRow[]): string | null => {
		for (const node of nodes) {
			if (!node.title.trim()) return m.menu_items_title_required();
			if (isResourceLink(node.linkType) && !node.resourceId) {
				return m.menu_items_target_required();
			}
			if (node.linkType === "EXTERNAL_URL" && !node.url.trim()) {
				return m.menu_items_url_required();
			}
			const nested = validate(node.children);
			if (nested) return nested;
		}
		return null;
	};

	const toPayload = (nodes: EditorRow[]): MenuItemInput[] =>
		nodes.map((node) => {
			const translations = Object.fromEntries(
				Object.entries(node.translations).filter(([, value]) => value.trim()),
			);
			return {
				title: node.title.trim(),
				linkType: node.linkType,
				...(isResourceLink(node.linkType) && { resourceId: node.resourceId }),
				...(node.linkType === "EXTERNAL_URL" && { url: node.url.trim() }),
				...(Object.keys(translations).length > 0 && {
					titleTranslations: translations,
				}),
				...(node.children.length > 0 && { children: toPayload(node.children) }),
			};
		});

	const save = () => {
		const invalid = validate(rows);
		if (invalid) {
			setErrorMessage(invalid);
			return;
		}
		setErrorMessage(null);
		replaceItems.mutate(toPayload(rows), {
			onSuccess: () =>
				navigate({
					to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
					params: { tourOperatorId, menuId: menu.id },
				}),
			onError: (error) => setErrorMessage(apiErrorMessage(error)),
		});
	};

	const renderRows = (nodes: EditorRow[], depth: number) => (
		<div className="flex flex-col gap-3">
			{nodes.map((row, index) => (
				<div key={row.rowId} className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<div className="flex shrink-0 flex-col">
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={m.move_up()}
								disabled={index === 0}
								onClick={() => moveRow(row.rowId, -1)}
							>
								<ArrowUp />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={m.move_down()}
								disabled={index === nodes.length - 1}
								onClick={() => moveRow(row.rowId, 1)}
							>
								<ArrowDown />
							</Button>
						</div>
						<div className="flex min-w-0 grow flex-col gap-2">
							<div className="flex items-start gap-2">
								<Input
									aria-label={m.title()}
									placeholder={m.title()}
									value={row.title}
									onChange={(e) =>
										updateRow(row.rowId, { title: e.target.value })
									}
								/>
								<Select
									value={row.linkType}
									onValueChange={(v) =>
										// A changed kind invalidates the old payload.
										updateRow(row.rowId, {
											linkType: v as MenuLinkType,
											resourceId: "",
											url: "",
										})
									}
								>
									<SelectTrigger
										className="w-44 shrink-0"
										aria-label={m.menu_link_type()}
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{MENU_LINK_TYPES.map((type) => (
												<SelectItem key={type} value={type}>
													{menuLinkTypeLabel(type)}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							{isResourceLink(row.linkType) && (
								<AppMenuTargetSelect
									kind={row.linkType as "EXPERIENCE" | "PAGE"}
									tourOperatorId={tourOperatorId}
									value={row.resourceId}
									onValueChange={(v) => updateRow(row.rowId, { resourceId: v })}
									ariaLabel={m.menu_link_target()}
								/>
							)}
							{row.linkType === "EXTERNAL_URL" && (
								<Input
									aria-label={m.url()}
									placeholder="https://"
									value={row.url}
									onChange={(e) =>
										updateRow(row.rowId, { url: e.target.value })
									}
								/>
							)}
							{extraLocales.length > 0 && (
								<div className="flex flex-col gap-1.5">
									{extraLocales.map((locale) => (
										<div key={locale} className="flex items-center gap-2">
											<Badge
												variant="outline"
												className="w-10 shrink-0 justify-center font-mono uppercase"
											>
												{locale}
											</Badge>
											<Input
												aria-label={`${m.title()} (${locale})`}
												placeholder={row.title || m.title()}
												value={row.translations[locale] ?? ""}
												onChange={(e) =>
													updateRow(row.rowId, {
														translations: {
															...row.translations,
															[locale]: e.target.value,
														},
													})
												}
											/>
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
									onClick={() => addChild(row.rowId)}
								>
									<CornerDownRight />
								</Button>
							)}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={m.remove()}
								onClick={() => removeRow(row.rowId)}
							>
								<Trash2 />
							</Button>
						</div>
					</div>
					{row.children.length > 0 && (
						<div className="ml-8 border-l pl-4">
							{renderRows(row.children, depth + 1)}
						</div>
					)}
				</div>
			))}
		</div>
	);

	return (
		<Card>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						save();
					}}
					className="space-y-4"
				>
					{errorMessage && (
						<AppAlert title={m.error()} description={errorMessage} />
					)}
					{rows.length === 0 ? (
						<p className="text-sm text-muted-foreground">{m.no_menu_items()}</p>
					) : (
						renderRows(rows, 1)
					)}
					<div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setRows((prev) => [...prev, newRow()])}
						>
							<Plus />
							{m.add_menu_item()}
						</Button>
					</div>
					<AppFormActions
						isPending={replaceItems.isPending}
						submitLabel={m.save_changes()}
					/>
				</form>
			</CardContent>
		</Card>
	);
};
