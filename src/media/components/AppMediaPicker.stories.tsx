import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "../types";
import { AppMediaPicker } from "./AppMediaPicker";

const asset = (n: number): MediaAsset => ({
	id: `media-${n}`,
	context: "media",
	url: `https://picsum.photos/seed/vointika-${n}/240`,
	contentType: "image/jpeg",
	sizeBytes: 120_000,
	originalName: `photo-${n}.jpg`,
	alt: null,
	width: 240,
	height: 240,
	createdAt: "2026-03-01T10:00:00Z",
	uploadedBy: { id: "u-1", context: "users", name: "Ada" },
});

const ASSETS = Array.from({ length: 8 }, (_, i) => asset(i + 1));

const qc = storyQueryClient();
qc.setQueryData(queryKeys.mediaLibrary("op-1"), listPage(ASSETS));

const meta = {
	title: "Media/AppMediaPicker",
	component: AppMediaPicker,
	args: {
		tourOperatorId: "op-1",
		open: true,
		onOpenChange: () => {},
		onConfirm: () => {},
		initialSelected: [],
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<Story />
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMediaPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { mode: "single" } };
export const Multi: Story = {
	args: { mode: "multi", initialSelected: [ASSETS[0], ASSETS[2]] },
};
