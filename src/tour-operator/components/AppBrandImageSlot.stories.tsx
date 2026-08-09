import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppBrandImageSlot } from "./AppBrandImageSlot";

const OP = "op-1";
const MEDIA = "media-1";

const withImage = storyQueryClient((qc) =>
	qc.setQueryData(queryKeys.mediaAsset(OP, MEDIA), {
		id: MEDIA,
		url: "https://picsum.photos/seed/vointika-logo/240",
	}),
);
const empty = storyQueryClient();

const meta = {
	title: "TourOperator/AppBrandImageSlot",
	component: AppBrandImageSlot,
	args: {
		tourOperatorId: OP,
		slot: "logoMediaId",
		label: "Logo",
		hint: "The main logo, shown in the header.",
		mediaId: null,
		canWrite: true,
		pending: false,
		onFile: () => {},
		onClear: () => {},
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={empty}>
				<div className="w-80">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppBrandImageSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// Nothing uploaded yet: the dropzone, and no Remove to offer.
export const Empty: Story = {};

export const Filled: Story = {
	args: { mediaId: MEDIA },
	decorators: [
		(Story) => (
			<QueryClientProvider client={withImage}>
				<div className="w-80">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};

// Mid-upload: the dropzone is out and so is Remove.
export const Uploading: Story = { args: { mediaId: MEDIA, pending: true } };

// STAFF sees the image without a way to change it.
export const ReadOnly: Story = {
	args: { mediaId: MEDIA, canWrite: false },
	decorators: [
		(Story) => (
			<QueryClientProvider client={withImage}>
				<div className="w-80">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};
