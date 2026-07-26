import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import { AppAddAvailabilityDialog } from "./AppAddAvailabilityDialog";

const OP = "op-1";

const EXPERIENCES = [
	{ id: "e-1", name: "Sunset Sailing Tour" },
	{ id: "e-2", name: "Old Town Food Walk" },
	{ id: "e-3", name: "Vineyard Day Trip" },
];

const clientWith = (rows: { id: string; name: string }[]) => {
	const qc = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
		},
	});
	qc.setQueryData([...queryKeys.experiences(OP), "all-pages"], {
		pages: [{ data: rows, nextCursor: null }],
		pageParams: [null],
	});
	return qc;
};

const meta = {
	title: "Slots/AppAddAvailabilityDialog",
	component: AppAddAvailabilityDialog,
	args: { tourOperatorId: OP, open: true, onOpenChange: () => {} },
} satisfies Meta<typeof AppAddAvailabilityDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate =
	(rows: { id: string; name: string }[]) => (Story: React.ComponentType) => (
		<QueryClientProvider client={clientWith(rows)}>
			<Story />
		</QueryClientProvider>
	);

export const Default: Story = { decorators: [decorate(EXPERIENCES)] };

// No experiences yet → the picker points at creating one first.
export const NoExperiences: Story = { decorators: [decorate([])] };
