import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Brand } from "../types";
import { AppOperatorSocialLinksCard } from "./AppOperatorSocialLinksCard";

const OP = "op-1";

const brand = (socialLinks: Brand["socialLinks"]): Brand => ({
	slogan: null,
	shortDescription: null,
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	colors: { primary: [], secondary: [] },
	socialLinks,
});

const LINKS: Brand["socialLinks"] = [
	{ platform: "INSTAGRAM", url: "https://instagram.com/acme-tours" },
	{ platform: "WHATSAPP", url: "https://wa.me/18095551234" },
	{ platform: "TRIPADVISOR", url: "https://tripadvisor.com/acme" },
];

const qc = (links: Brand["socialLinks"]) =>
	storyQueryClient((c) =>
		c.setQueryData(queryKeys.operatorDetails(OP), { brand: brand(links) }),
	);

const withBrand = (links: Brand["socialLinks"]) => [
	(Story: () => React.ReactElement) => (
		<QueryClientProvider client={qc(links)}>
			<Story />
		</QueryClientProvider>
	),
];

const meta = {
	title: "TourOperator/AppOperatorSocialLinksCard",
	component: AppOperatorSocialLinksCard,
	args: { tourOperatorId: OP, canWrite: true },
} satisfies Meta<typeof AppOperatorSocialLinksCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = { decorators: withBrand(LINKS) };

export const Empty: Story = { decorators: withBrand([]) };

export const AllPlatformsUsed: Story = {
	decorators: withBrand([
		{ platform: "FACEBOOK", url: "https://facebook.com/acme" },
		{ platform: "INSTAGRAM", url: "https://instagram.com/acme" },
		{ platform: "TIKTOK", url: "https://tiktok.com/@acme" },
		{ platform: "YOUTUBE", url: "https://youtube.com/@acme" },
		{ platform: "TWITTER", url: "https://twitter.com/acme" },
		{ platform: "PINTEREST", url: "https://pinterest.com/acme" },
		{ platform: "TRIPADVISOR", url: "https://tripadvisor.com/acme" },
		{ platform: "WHATSAPP", url: "https://wa.me/18095551234" },
	]),
};

export const ReadOnly: Story = {
	args: { canWrite: false },
	decorators: withBrand(LINKS),
};
