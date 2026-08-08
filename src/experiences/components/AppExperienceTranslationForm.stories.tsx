import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { Experience, ExperienceTranslation } from "../types";
import { AppExperienceTranslationForm } from "./AppExperienceTranslationForm";

const CANONICAL: Experience = {
	id: "e-1",
	context: "experiences",
	name: "Sunset Kayak Tour",
	handle: "sunset-kayak-tour",
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

const EMPTY: ExperienceTranslation = {
	locale: "es",
	name: null,
	description: null,
	longDescription: null,
	highlights: null,
	included: null,
	notIncluded: null,
	handle: null,
};

const TRANSLATED: ExperienceTranslation = {
	locale: "es",
	name: "Tour en kayak al atardecer",
	description: "Rema por la bahía al caer el sol, con un guía local.",
	longDescription: null,
	highlights: ["Luz dorada", "Grupos pequeños"],
	included: null,
	notIncluded: null,
	handle: "tour-kayak-atardecer",
};

const qc = storyQueryClient();

const meta = {
	title: "Experiences/AppExperienceTranslationForm",
	component: AppExperienceTranslationForm,
	args: {
		tourOperatorId: "op-1",
		experienceId: "e-1",
		locale: "es",
		canonical: CANONICAL,
	},
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppExperienceTranslationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Untranslated: Story = { args: { translation: EMPTY } };
export const Translated: Story = { args: { translation: TRANSLATED } };
