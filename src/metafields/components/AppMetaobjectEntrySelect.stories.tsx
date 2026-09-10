import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppMetaobjectEntrySelect } from "./AppMetaobjectEntrySelect";

const OP = "op-1";
const PIN = "mo-1";

const qc = storyQueryClient((qc) =>
	qc.setQueryData(
		[...queryKeys.metaobjects(OP), "all-pages"],
		listPage([
			{
				id: "e-1",
				definitionId: PIN,
				handle: "beginner",
				name: "Beginner chart",
			},
			{ id: "e-2", definitionId: PIN, handle: "pro", name: "Pro chart" },
			{ id: "e-3", definitionId: "mo-2", handle: "maria", name: "María" },
		]),
	),
);

const meta = {
	title: "Metafields/AppMetaobjectEntrySelect",
	component: AppMetaobjectEntrySelect,
	args: {
		inputId: "demo",
		tourOperatorId: OP,
		metaobjectDefinitionId: PIN,
		value: "e-1",
		onValueChange: () => {},
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-md">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMetaobjectEntrySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
