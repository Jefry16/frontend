import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from "@vointika/ui";
import { AppQueryState } from "./AppQueryState";

const result = (
	over: Partial<UseQueryResult<string>>,
): UseQueryResult<string> =>
	({
		data: undefined,
		isPending: false,
		error: null,
		refetch: () => {},
		...over,
	}) as UseQueryResult<string>;

const meta = {
	title: "Shared/AppQueryState",
	component: AppQueryState,
	args: {
		loading: <Skeleton className="h-9 w-full" />,
		children: (v: string) => <p className="text-sm">{v}</p>,
	},
	decorators: [
		(Story) => (
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>Search engine listing</CardTitle>
				</CardHeader>
				<CardContent>
					<Story />
				</CardContent>
			</Card>
		),
	],
} satisfies Meta<typeof AppQueryState<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { query: result({ isPending: true }) } };

export const Loaded: Story = {
	args: { query: result({ data: "Kayak tours in Sosúa — book online" }) },
};

export const Failed: Story = {
	args: { query: result({ error: new Error("Network error") }) },
};
