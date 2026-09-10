import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Experience, ExperienceTranslation } from "../types";
import { AppExperienceTranslations } from "./AppExperienceTranslations";

const OP = "op-1";
const EXP = "e-1";

const EXPERIENCE: Experience = {
	id: EXP,
	context: "experiences",
	name: "Sunset Kayak Tour",
	handle: "sunset-kayak-tour",
	description: "Paddle the bay as the sun goes down, with a local guide.",
	longDescription:
		"A relaxed two-and-a-half hour paddle timed for golden hour.",
	featured: true,
	thumbnailMediaId: null,
	thumbnailUrl: null,
	mediaIds: [],
	galleryUrls: [],
	bookingCutoffHours: 24,
	startingPrice: 95,
	published: true,
	seoTitle: null,
	seoDescription: null,
	createdBy: "u-1",
	createdAt: "2026-03-01T10:00:00Z",
};

const ES: ExperienceTranslation = {
	locale: "es",
	name: "Tour en kayak al atardecer",
	description: null,
	longDescription: null,
	handle: null,
	seoTitle: null,
	seoDescription: null,
};

// One operator with three languages (en primary), Spanish already translated.
function client() {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.experience(OP, EXP), EXPERIENCE);
	qc.setQueryData(queryKeys.operatorDetails(OP), {
		locales: {
			primaryLocale: "en",
			supportedLocales: ["en", "es", "fr"],
		},
	});
	qc.setQueryData(queryKeys.experienceTranslations(OP, EXP), [ES]);
	qc.setQueryData(queryKeys.experienceTranslation(OP, EXP, "es"), ES);
	return qc;
}

const meta = {
	title: "Experiences/AppExperienceTranslations",
	component: AppExperienceTranslations,
	args: { tourOperatorId: OP, experienceId: EXP, canWrite: true },
	decorators: [
		(Story) => (
			<QueryClientProvider client={client()}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppExperienceTranslations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A STAFF member: the stored overlay, read-only — reads are member-level. */
export const ReadOnly: Story = {
	args: { canWrite: false },
};
