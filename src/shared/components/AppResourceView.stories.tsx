import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Skeleton } from "@vointika/ui";
import { Compass } from "lucide-react";
import { AppResourceView } from "./AppResourceView";

const query = (over: Partial<UseQueryResult<string>>): UseQueryResult<string> =>
	({
		data: undefined,
		isPending: false,
		error: null,
		refetch: () => {},
		...over,
	}) as unknown as UseQueryResult<string>;

const meta = {
	title: "Shared/AppResourceView",
	component: AppResourceView<string>,
	args: {
		resource: "Experience",
		icon: Compass,
		loading: <Skeleton className="h-40 w-full" />,
		children: (data: string) => <div className="text-sm">Loaded: {data}</div>,
	},
} satisfies Meta<typeof AppResourceView<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
	args: { query: query({ data: "Sunset Kayak Tour" }) },
};
export const Loading: Story = { args: { query: query({ isPending: true }) } };
export const NotFound: Story = {
	args: {
		query: query({ error: { response: { status: 404 } } as never }),
	},
};
export const ErrorState: Story = {
	args: {
		query: query({ error: new Error("Server error") as never }),
	},
};
