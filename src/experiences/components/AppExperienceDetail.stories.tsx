import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Experience } from "../types";
import { AppExperienceDetail } from "./AppExperienceDetail";

const OP_ID = "op-1";
const EXP_ID = "e-1";

const EXPERIENCE: Experience = {
	id: EXP_ID,
	context: "experiences",
	name: "Sunset Kayak Tour",
	handle: "sunset-kayak-tour",
	description: "Paddle the bay as the sun goes down, with a local guide.",
	longDescription:
		"A relaxed two-and-a-half hour paddle timed for golden hour. We launch from the old harbour, hug the cliffs, and pause on a quiet cove for photos before returning under the first stars.",
	featured: true,
	thumbnailMediaId: null,
	thumbnailUrl: null,
	mediaIds: [],
	galleryUrls: [],
	durationMinutes: 150,
	bookingCutoffHours: 24,
	published: true,
	createdBy: "u-1",
	createdAt: "2026-03-01T10:00:00Z",
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.experience(OP_ID, EXP_ID), EXPERIENCE);
qc.setQueryData(
	queryKeys.activityTimeline(OP_ID, "EXPERIENCE", EXP_ID),
	listPage([]),
);
// Empty definitions catalogue — the metafields card resolves and renders null.
qc.setQueryData(
	[...queryKeys.metafieldDefinitions(OP_ID), "all-pages"],
	listPage([]),
);
qc.setQueryData(queryKeys.metafieldValues(OP_ID, "experience", EXP_ID), []);

const meta = {
	title: "Experiences/AppExperienceDetail",
	component: AppExperienceDetail,
	args: { tourOperatorId: OP_ID, experienceId: EXP_ID },
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
} satisfies Meta<typeof AppExperienceDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
