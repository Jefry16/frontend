import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { AppCardBody } from "./AppCardBody";

// Hand-built query results — the states matter, not how they were fetched.
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
	title: "Shared/AppCardBody",
	component: AppCardBody,
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
} satisfies Meta<typeof AppCardBody<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

// The header stays put while the body resolves.
export const Loading: Story = { args: { query: result({ isPending: true }) } };

export const Loaded: Story = {
	args: { query: result({ data: "Kayak tours in Sosúa — book online" }) },
};

// The state three cards used to swallow into a permanent skeleton.
export const Failed: Story = {
	args: { query: result({ error: new Error("Network error") }) },
};
