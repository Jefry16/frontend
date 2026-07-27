import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Experience } from "../types";
import { AppExperienceEdit } from "./AppExperienceEdit";

const OP_ID = "op-1";
const EXP_ID = "e-1";

const EXPERIENCE: Experience = {
	id: EXP_ID,
	context: "experiences",
	name: "Sunset Kayak Tour",
	slug: "sunset-kayak-tour",
	description: "Paddle the bay as the sun goes down, with a local guide.",
	longDescription:
		"A relaxed two-and-a-half hour paddle timed for golden hour.",
	featured: true,
	tags: ["water", "sunset"],
	included: ["Kayak & paddle", "Life jacket"],
	notIncluded: ["Hotel pickup"],
	highlights: ["Golden-hour light", "Small groups"],
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

const meta = {
	title: "Experiences/AppExperienceEdit",
	component: AppExperienceEdit,
	args: { tourOperatorId: OP_ID, experienceId: EXP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppExperienceEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
