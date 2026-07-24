import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";
import { AppMediaDetail } from "./AppMediaDetail";

const OP_ID = "op-1";
const MEDIA_ID = "m-1";

const IMG =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='160' height='120' fill='%234f46e5'/></svg>",
	);

const MEDIA: MediaAsset = {
	id: MEDIA_ID,
	context: "media",
	url: IMG,
	contentType: "image/png",
	sizeBytes: 245760,
	originalName: "ada-tour.png",
	createdAt: "2026-03-01T10:00:00Z",
	uploadedBy: { id: "u-1", context: "users", name: "Ada Lovelace" },
};

const qc = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
	},
});
qc.setQueryData(queryKeys.mediaAsset(OP_ID, MEDIA_ID), MEDIA);

const meta = {
	title: "Media/AppMediaDetail",
	component: AppMediaDetail,
	args: { tourOperatorId: OP_ID, mediaId: MEDIA_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="mx-auto w-full max-w-3xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMediaDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
