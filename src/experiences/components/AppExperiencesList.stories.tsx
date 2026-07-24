import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { Experience } from "../types";
import { AppExperiencesList } from "./AppExperiencesList";

const OP_ID = "op-1";

const base = {
	context: "experiences" as const,
	slug: "",
	description: "",
	longDescription: "",
	featured: false,
	tags: [],
	included: [],
	notIncluded: [],
	highlights: [],
	galleryUrls: [],
	bookingCutoffHours: 24,
	createdBy: "u-1",
};

const EXPERIENCES: Experience[] = [
	{
		...base,
		id: "e-1",
		name: "Sunset kayak tour",
		thumbnailUrl: null,
		durationMinutes: 150,
		published: true,
		createdAt: "2026-03-01T10:00:00Z",
	},
	{
		...base,
		id: "e-2",
		name: "Old town walking tour",
		thumbnailUrl: null,
		durationMinutes: 90,
		published: false,
		createdAt: "2026-02-08T09:00:00Z",
	},
	{
		...base,
		id: "e-3",
		name: "Wine tasting afternoon",
		thumbnailUrl: null,
		durationMinutes: 45,
		published: true,
		createdAt: "2026-02-02T08:00:00Z",
	},
];

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(
	[
		...queryKeys.experiences(OP_ID),
		`/tour-operators/${OP_ID}/experiences`,
		[],
		[],
		undefined,
	],
	{ pages: [{ data: EXPERIENCES, nextCursor: null }], pageParams: [null] },
);

const meta = {
	title: "Experiences/AppExperiencesList",
	component: AppExperiencesList,
	args: { tourOperatorId: OP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppExperiencesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
