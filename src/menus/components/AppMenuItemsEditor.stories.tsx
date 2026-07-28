import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";
import { AppMenuItemsEditor } from "./AppMenuItemsEditor";

const OP = "op-1";

const MENU: Menu = {
	id: "m-1",
	context: "menus",
	handle: "main-menu",
	title: "Main menu",
	items: [
		{
			id: "i-1",
			title: "Home",
			linkType: "HOME",
			resourceId: null,
			url: null,
			titleTranslations: { es: "Inicio" },
			children: [],
		},
		{
			id: "i-2",
			title: "Explore",
			linkType: "EXPERIENCE_LIST",
			resourceId: null,
			url: null,
			titleTranslations: {},
			children: [
				{
					id: "i-3",
					title: "Sunset Sailing Tour",
					linkType: "EXPERIENCE",
					resourceId: "e-1",
					url: null,
					titleTranslations: {},
					children: [],
				},
			],
		},
	],
	createdAt: "2026-07-28T10:00:00Z",
	updatedAt: "2026-07-28T10:00:00Z",
};

const qc = storyQueryClient((qc) => {
	qc.setQueryData(queryKeys.operatorLocales(OP), {
		primaryLocale: "en",
		supportedLocales: ["en", "es"],
	});
	qc.setQueryData(
		[...queryKeys.experiences(OP), "all-pages"],
		listPage([{ id: "e-1", name: "Sunset Sailing Tour" }]),
	);
	qc.setQueryData(
		[...queryKeys.pages(OP), "all-pages"],
		listPage([{ id: "p-1", title: "About us", handle: "about-us" }]),
	);
});

const meta = {
	title: "Menus/AppMenuItemsEditor",
	component: AppMenuItemsEditor,
	args: { tourOperatorId: OP, menu: MENU },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMenuItemsEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
