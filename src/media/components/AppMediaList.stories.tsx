import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";
import { AppMediaList } from "./AppMediaList";

const OP_ID = "op-1";

const IMG =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%234f46e5'/></svg>",
	);

const MEDIA: MediaAsset[] = [
	{
		id: "m-1",
		context: "media",
		url: IMG,
		contentType: "image/png",
		sizeBytes: 245760,
		originalName: "ada-tour.png",
		createdAt: "2026-03-01T10:00:00Z",
		uploadedBy: { id: "u-1", context: "users", name: "Ada Lovelace" },
	},
	{
		id: "m-2",
		context: "media",
		url: IMG,
		contentType: "image/jpeg",
		sizeBytes: 1258291,
		originalName: "harbor-hero.jpg",
		createdAt: "2026-02-08T09:00:00Z",
		uploadedBy: { id: "u-1", context: "users", name: "Ada Lovelace" },
	},
	{
		id: "m-3",
		context: "media",
		url: "",
		contentType: "application/pdf",
		sizeBytes: 90112,
		originalName: "terms.pdf",
		createdAt: "2026-02-02T08:00:00Z",
		uploadedBy: { id: "u-2", context: "users", name: null },
	},
];

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(
	[
		...queryKeys.media(OP_ID),
		`/tour-operators/${OP_ID}/media`,
		[],
		[],
		undefined,
	],
	{ pages: [{ data: MEDIA, nextCursor: null }], pageParams: [null] },
);

const meta = {
	title: "Media/AppMediaList",
	component: AppMediaList,
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
} satisfies Meta<typeof AppMediaList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
