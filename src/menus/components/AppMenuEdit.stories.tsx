import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";
import { AppMenuEdit } from "./AppMenuEdit";

const OP = "op-1";
const MENU_ID = "m-1";

const MENU: Menu = {
	id: MENU_ID,
	context: "menus",
	handle: "footer",
	title: "Footer",
	items: [
		{
			id: "i-1",
			title: "Contact",
			linkType: "PAGE",
			resourceId: "p-1",
			url: null,
			titleTranslations: {},
			children: [],
		},
	],
	createdAt: "2026-07-28T10:00:00Z",
	updatedAt: "2026-07-28T10:00:00Z",
};

const qc = storyQueryClient((qc) => {
	qc.setQueryData(queryKeys.menu(OP, MENU_ID), MENU);
	qc.setQueryData(queryKeys.operatorLocales(OP), {
		primaryLocale: "en",
		supportedLocales: ["en"],
	});
	qc.setQueryData(
		[...queryKeys.experiences(OP), "all-pages"],
		listPage([{ id: "e-1", name: "Sunset Sailing Tour" }]),
	);
	qc.setQueryData(
		[...queryKeys.pages(OP), "all-pages"],
		listPage([{ id: "p-1", title: "Contact", handle: "contact" }]),
	);
});

const meta = {
	title: "Menus/AppMenuEdit",
	component: AppMenuEdit,
	args: { tourOperatorId: OP, menuId: MENU_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMenuEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
