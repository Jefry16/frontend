import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MediaAsset } from "#/media";
import { AppExperienceMediaSection } from "./AppExperienceMediaSection";

const OP = "op-1";

const asset = (n: number): MediaAsset => ({
	id: `media-${n}`,
	context: "media",
	url: `https://picsum.photos/seed/vointika-${n}/240`,
	contentType: "image/jpeg",
	sizeBytes: 120_000,
	originalName: `photo-${n}.jpg`,
	createdAt: "2026-03-01T10:00:00Z",
	uploadedBy: { id: "u-1", context: "users", name: "Ada" },
});

// Seed the per-id cache so useMediaByIds resolves previews without a backend.
function client(ids: number[]) {
	const qc = storyQueryClient();
	for (const n of ids) {
		qc.setQueryData(queryKeys.mediaAsset(OP, `media-${n}`), asset(n));
	}
	return qc;
}

const meta = {
	title: "Experiences/AppExperienceMediaSection",
	component: AppExperienceMediaSection,
	args: {
		tourOperatorId: OP,
		onThumbnailChange: () => {},
		onGalleryChange: () => {},
	},
} satisfies Meta<typeof AppExperienceMediaSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: { thumbnailMediaId: null, mediaIds: [] },
	decorators: [
		(Story) => (
			<QueryClientProvider client={client([])}>
				<div className="mx-auto w-full max-w-2xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};

export const WithMedia: Story = {
	// The cover (thumbnail) is one of the media items — the backend's invariant.
	args: {
		thumbnailMediaId: "media-2",
		mediaIds: ["media-2", "media-3", "media-4"],
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={client([2, 3, 4])}>
				<div className="mx-auto w-full max-w-2xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
};
