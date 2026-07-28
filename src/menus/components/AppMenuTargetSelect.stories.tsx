import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppMenuTargetSelect } from "./AppMenuTargetSelect";

const OP = "op-1";

const qc = storyQueryClient((qc) => {
	qc.setQueryData(
		[...queryKeys.experiences(OP), "all-pages"],
		listPage([
			{ id: "e-1", name: "Sunset Sailing Tour" },
			{ id: "e-2", name: "Coastal Kayak Trip" },
		]),
	);
	qc.setQueryData(
		[...queryKeys.pages(OP), "all-pages"],
		listPage([
			{ id: "p-1", title: "About us", handle: "about-us" },
			{ id: "p-2", title: "Contact", handle: "contact" },
		]),
	);
});

const meta = {
	title: "Menus/AppMenuTargetSelect",
	component: AppMenuTargetSelect,
	args: {
		kind: "EXPERIENCE",
		tourOperatorId: OP,
		value: "",
		onValueChange: () => {},
		ariaLabel: "Link target",
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-sm">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMenuTargetSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Experiences: Story = {};
export const Pages: Story = { args: { kind: "PAGE" } };
