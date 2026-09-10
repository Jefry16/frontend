import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Brand } from "../types";
import { AppOperatorColorsCard } from "./AppOperatorColorsCard";

const OP = "op-1";

const brand = (colors: Brand["colors"]): Brand => ({
	slogan: null,
	shortDescription: null,
	logoMediaId: null,
	squareLogoMediaId: null,
	faviconMediaId: null,
	coverImageMediaId: null,
	colors,
	socialLinks: [],
});

const PALETTE: Brand["colors"] = {
	primary: [
		{ background: "#0b3d5c", foreground: "#ffffff" },
		{ background: "#12688f", foreground: "#ffffff" },
	],
	secondary: [{ background: "#f4a259", foreground: "#1a1a1a" }],
};

const qc = (colors: Brand["colors"]) =>
	storyQueryClient((c) =>
		c.setQueryData(queryKeys.operatorDetails(OP), { brand: brand(colors) }),
	);

const withBrand = (colors: Brand["colors"]) => [
	(Story: () => React.ReactElement) => (
		<QueryClientProvider client={qc(colors)}>
			<Story />
		</QueryClientProvider>
	),
];

const meta = {
	title: "TourOperator/AppOperatorColorsCard",
	component: AppOperatorColorsCard,
	args: { tourOperatorId: OP, canWrite: true },
} satisfies Meta<typeof AppOperatorColorsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = { decorators: withBrand(PALETTE) };

/** No palette yet — the theme falls back to its own. */
export const Empty: Story = {
	decorators: withBrand({ primary: [], secondary: [] }),
};

/** A STAFF member reads the palette; writing it is ADMIN+. */
export const ReadOnly: Story = {
	args: { canWrite: false },
	decorators: withBrand(PALETTE),
};

/** Read-only with nothing set — the one state that shows the empty line. */
export const ReadOnlyEmpty: Story = {
	args: { canWrite: false },
	decorators: withBrand({ primary: [], secondary: [] }),
};
